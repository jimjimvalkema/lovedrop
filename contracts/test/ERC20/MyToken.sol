// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
<<<<<<< HEAD
    constructor() ERC20("airdropToken", "AIR") {}
=======
    constructor() ERC20("MyToken", "MTK") {}
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
