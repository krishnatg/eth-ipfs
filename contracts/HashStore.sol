pragma solidity ^0.4.18;

/*contract to store Hash of CA certificates stored on IPFS*/
contract HashStore {
    /*
    * Events
    */
    event NewHashStored(address indexed _hashSender, uint _hashId, string _hashContent, uint timestamp);

    /*
    * Storage
    */
    struct CertificateHash {
        // CA address
        address CAAddr;
        // hash text
        string certificateHash;
        // creation timestamp
        uint timestamp;
    }

    // Certificate Hashes mapping
    // node-address => CertificateHash
    mapping(address => CertificateHash) hashes;
    // Contract owner
    address owner;
    // Last stored Hash Id
    uint lastHashId;

    // CA server address mapping
    // CA-address => True
    mapping(address => bool) CAServers;

    /*
    * modifiers
    */
    modifier onlyOwner {
        assert(msg.sender == owner);
        _;
    }

    modifier onlyCaServer {
        require(CAServers[msg.sender]);
        _;
    }


    /*
    * Constructor
    */
    constructor() public {
        // assign owner
        owner = msg.sender;
        // Add creator of contract to List of CAServers
        CAServers[owner] = true;
        //Set lastHashId
        lastHashId = 0;
    }


    /**
    * @dev save new hash
    * @param _hashContent Hash Content
    * @param _nodeAddress address of the node whose cert is being added
    */
    function saveCertificate(address _nodeAddress, string _hashContent) onlyCaServer public {
        // create CertificateHash
        uint hashId = ++lastHashId;
        hashes[_nodeAddress].CAAddr = msg.sender;
        hashes[_nodeAddress].certificateHash = _hashContent;
        hashes[_nodeAddress].timestamp = block.timestamp;

        // Log event
        emit NewHashStored(hashes[_nodeAddress].CAAddr, hashId, hashes[_nodeAddress].certificateHash, hashes[_nodeAddress].timestamp);
    }

    /**
    * @dev find hash by address
    * @param _nodeAddress address of node whose cert is being requested
    */

    function getCertificate(address _nodeAddress) constant public returns (address hashSender, string hashContent, uint hashTimestamp) {
        return (hashes[_nodeAddress].CAAddr, hashes[_nodeAddress].certificateHash, hashes[_nodeAddress].timestamp);
    }

    /**
    * @dev Add CA server
    * @param _address address of node CA server
    */
    function addCAServer(address _address) onlyOwner public {
        CAServers[_address] = true;
    }
}