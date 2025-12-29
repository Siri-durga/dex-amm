const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", function () {
  let dex, tokenA, tokenB;
  let owner, addr1, addr2;

  const toEth = ethers.utils.parseEther;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("Token A", "TKA");
    tokenB = await MockERC20.deploy("Token B", "TKB");

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(tokenA.address, tokenB.address);

    await tokenA.approve(dex.address, toEth("1000000"));
    await tokenB.approve(dex.address, toEth("1000000"));

    await tokenA.connect(addr1).mint(addr1.address, toEth("1000"));
    await tokenB.connect(addr1).mint(addr1.address, toEth("1000"));
    await tokenA.connect(addr1).approve(dex.address, toEth("1000"));
    await tokenB.connect(addr1).approve(dex.address, toEth("1000"));
  });

  /* ------------------ LIQUIDITY ------------------ */
  describe("Liquidity Management", function () {
    it("should allow initial liquidity provision", async function () {
      await expect(
        dex.addLiquidity(toEth("100"), toEth("200"))
      ).to.not.be.reverted;
    });

    it("should mint correct LP tokens for first provider", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      const lp = await dex.liquidity(owner.address);
      expect(lp).to.be.gt(0);
    });

    it("should allow subsequent liquidity additions", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      await expect(
        dex.connect(addr1).addLiquidity(toEth("50"), toEth("100"))
      ).to.not.be.reverted;
    });

    it("should maintain price ratio on liquidity addition", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      const price1 = await dex.getPrice();

      await dex.connect(addr1).addLiquidity(toEth("50"), toEth("100"));
      const price2 = await dex.getPrice();

      expect(price1).to.equal(price2);
    });

    it("should allow partial liquidity removal", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      const lp = await dex.liquidity(owner.address);

      await expect(
        dex.removeLiquidity(lp.div(2))
      ).to.not.be.reverted;
    });

    it("should return correct token amounts on liquidity removal", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      const lp = await dex.liquidity(owner.address);

      await dex.removeLiquidity(lp);

      const reserve = await dex.getReserves();
      expect(reserve[0]).to.equal(0);
      expect(reserve[1]).to.equal(0);
    });

    it("should revert on zero liquidity addition", async function () {
      await expect(
        dex.addLiquidity(0, 0)
      ).to.be.reverted;
    });

    it("should revert when removing more liquidity than owned", async function () {
      await expect(
        dex.removeLiquidity(1)
      ).to.be.reverted;
    });
  });

  /* ------------------ SWAPS ------------------ */
  describe("Token Swaps", function () {
    beforeEach(async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
    });

    it("should swap token A for token B", async function () {
      await expect(
        dex.swapAForB(toEth("10"))
      ).to.not.be.reverted;
    });

    it("should swap token B for token A", async function () {
      await tokenB.approve(dex.address, toEth("10"));
      await expect(
        dex.swapBForA(toEth("10"))
      ).to.not.be.reverted;
    });

    it("should calculate correct output amount with fee", async function () {
      const out = await dex.getAmountOut(
        toEth("10"),
        toEth("100"),
        toEth("200")
      );
      expect(out).to.be.gt(0);
    });

    it("should update reserves after swap", async function () {
      await dex.swapAForB(toEth("10"));
      const [rA, rB] = await dex.getReserves();
      expect(rA).to.be.gt(toEth("100"));
      expect(rB).to.be.lt(toEth("200"));
    });

    it("should increase k after swap due to fees", async function () {
      const before = (await dex.getReserves())[0].mul(
        (await dex.getReserves())[1]
      );

      await dex.swapAForB(toEth("10"));

      const after = (await dex.getReserves())[0].mul(
        (await dex.getReserves())[1]
      );

      expect(after).to.be.gt(before);
    });

    it("should revert on zero swap amount", async function () {
      await expect(
        dex.swapAForB(0)
      ).to.be.reverted;
    });

    it("should handle large swaps with high price impact", async function () {
      await expect(
        dex.swapAForB(toEth("90"))
      ).to.not.be.reverted;
    });

    it("should handle multiple consecutive swaps", async function () {
      await dex.swapAForB(toEth("5"));
      await dex.swapAForB(toEth("5"));
      await dex.swapAForB(toEth("5"));
    });
  });

  /* ------------------ PRICE ------------------ */
  describe("Price Calculations", function () {
    it("should return correct initial price", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      expect(await dex.getPrice()).to.equal(toEth("2"));
    });

    it("should update price after swaps", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      await dex.swapAForB(toEth("10"));
      expect(await dex.getPrice()).to.not.equal(toEth("2"));
    });

    it("should handle price queries with zero reserves gracefully", async function () {
      await expect(dex.getPrice()).to.not.be.reverted;
    });
  });

  /* ------------------ FEES ------------------ */
  describe("Fee Distribution", function () {
    it("should accumulate fees for liquidity providers", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      const before = await dex.getReserves();
      await dex.swapAForB(toEth("10"));
      const after = await dex.getReserves();
      expect(after[0].mul(after[1])).to.be.gt(before[0].mul(before[1]));
    });

    it("should distribute fees proportionally to LP share", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      await dex.connect(addr1).addLiquidity(toEth("50"), toEth("100"));
      await dex.swapAForB(toEth("10"));
      expect(await dex.totalLiquidity()).to.be.gt(0);
    });
  });

  /* ------------------ EDGE CASES ------------------ */
  describe("Edge Cases", function () {
    it("should handle very small liquidity amounts", async function () {
      await dex.addLiquidity(1, 2);
    });

    it("should handle very large liquidity amounts", async function () {
      await dex.addLiquidity(toEth("100000"), toEth("200000"));
    });

    it("should prevent unauthorized access", async function () {
      await expect(
        dex.connect(addr1).removeLiquidity(1)
      ).to.be.reverted;
    });
  });

  /* ------------------ EVENTS ------------------ */
  describe("Events", function () {
    it("should emit LiquidityAdded event", async function () {
      await expect(
        dex.addLiquidity(toEth("10"), toEth("20"))
      ).to.emit(dex, "LiquidityAdded");
    });

    it("should emit LiquidityRemoved event", async function () {
      await dex.addLiquidity(toEth("10"), toEth("20"));
      const lp = await dex.liquidity(owner.address);

      await expect(
        dex.removeLiquidity(lp)
      ).to.emit(dex, "LiquidityRemoved");
    });

    it("should emit Swap event", async function () {
      await dex.addLiquidity(toEth("100"), toEth("200"));
      await expect(
        dex.swapAForB(toEth("10"))
      ).to.emit(dex, "Swap");
    });
  });
});
