//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.0 <0.7.0;

import "./BaseRelayRecipient.sol";

contract Migrations is BaseRelayRecipient {
    address public owner;

    // A function with the signature `last_completed_migration()`, returning a uint, is required.
    uint public last_completed_migration;

    modifier restricted() {
        if (_msgSender() == owner) _;
    }

    constructor() public {
        owner = _msgSender();
    }

    function setCompleted(uint completed) public {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) public {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}