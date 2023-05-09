const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deploy contracts", function () {
let deployer, user, attacker;
let bankContract, attackerContract;

beforeEach(async function () {
[deployer, user, attacker] = await ethers.getSigners();

const BankFactory = await ethers.getContractFactory("Bank", deployer);
bankContract = await BankFactory.deploy();

await bankContract.deposit({ value: ethers.utils.parseEther("100") });
await bankContract.connect(user).deposit({ value: ethers.utils.parseEther("50") });

const AttackerFactory = await ethers.getContractFactory("Attacker", attacker);
attackerContract = await AttackerFactory.deploy(bankContract.address);

});

describe("Test deposit and withdraw of Bank contract", function () {
it("Should accept deposits", async function () {
const deployerBalance = await bankContract.balanceOf(deployer.address);
expect(deployerBalance).to.eq(ethers.utils.parseEther("100"));

const userBalance = await bankContract.balanceOf(user.address);
expect(userBalance).to.eq(ethers.utils.parseEther("50"));
});

it("Should accept withdrawals", async function () {
await bankContract.withdraw();

const deployerBalance = await bankContract.balanceOf(deployer.address);
const userBalance = await bankContract.balanceOf(user.address);

expect(deployerBalance).to.eq(0);
expect(userBalance).to.eq(ethers.utils.parseEther("50"));
});

it("Perform Attack", async function () {
console.log("");
console.log("*** Before ***");
console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bankContract.address)).toString()}`);
console.log(`Attacker's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`);

await attackerContract.attack({ value: ethers.utils.parseEther("10") });

console.log("");
console.log("*** After ***");
console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bankContract.address)).toString()}`);
console.log(`Attackers's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`);
console.log("");

expect(await ethers.provider.getBalance(bankContract.address)).to.eq(0);
});
});
});
