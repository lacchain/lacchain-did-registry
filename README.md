# LACChain DID Method

[DID Specification](http://dev.lacchain.net/en/did-method) | [NodeJS Implementation](https://github.com/lacchain/lacchain-did-js)

This repository is based on [ERC-1056](https://github.com/ethereum/EIPs/issues/1056) and is intended to use Ethereum addresses as fully self-managed [Decentralized Identifiers](https://w3c-ccg.github.io/did-spec/#decentralized-identifiers-dids) (DIDs), it allows you to easily create and manage keys for these identities.  
It also lets you sign standards compliant [JSON Web Tokens (JWT)](https://jwt.io).

This smart contracts can be used to create a new did identity called "lac".  It allows identities to be represented as an object that can perform actions such as updating its did-document, signing messages, and verifying messages from other dids.

LACChain DID provide a scalable identity method for Ethereum addresses that gives any Ethereum address the ability to collect on-chain and off-chain data. Because this DID method allows any Ethereum key pair to become an identity, it is more scalable and privacy-preserving than smart contract based identity methods.

## DID Registry

This library contains the Ethereum contract code that allows the owner of a LAC DID identity to update the attributes that appear in his DID Document.

These contracts allow Ethereum addresses to present signing information about themselves with no prior registration. It allows them to perform key rotation and specify different keys and services that are used on its behalf for both on and off-chain usage.

Depending on the functionalities that you want to use, there are two smart contracts to create a DID Registry.

1. **DIDRegistry**: It is the basic DID Registry that allows multiple controllers and automatic key rotation.
  The parameters for deployment are:
   - `minKeyRotationTime`:  The minimum time (in seconds) to automatically rotate the controller (each DID can set their own rotation time, but it can be less than this value)
2. **DIDRegistryRecoverable**: It is the advanced DID Registry that allows, in addition to the functions of a basic DID, key recovery.
   The parameters for deployment are:
   - `minKeyRotationTime (uint)`: The minimum time (in seconds) to automatically rotate the controller (inherit from DID Registry)
   - `maxAttempts (uint)`: The maximum number of failed attempts in the reset period
   - `minControllers (uint)`: The minimum number of controller that must have the account to be able to use this feature
   - `resetSeconds (uint)`: The reset time period (in seconds). When the account exceeds the `maxAttempts`, the account must wait to reach the `resetSeconds` time before to call again the function to recover the account.
     When this time period is reached, the keys successfully proved to recover the account will be deleted, in that case is needed to prove again the controllers to recover the account.

The official DID Registries are deployed in the LACChain Main Network:

| Registry                | Address                                     | Parameters                   |
|-------------------------|---------------------------------------------|------------------------------|
| DIDRegistry             | 0xDF1EbaE3e2318AA57CFaf11E1Dd3531D5A5AdA04  | **minKeyRotationTime**: 3600
| DIDRegistryRecoverable  | 0xCC77A5e709cB473F49c943D9b40B989f986E5F2F  | **minKeyRotationTime**: 3600 <br /> **maxAttempts**: 3 <br /> **minControllers**: 5 <br /> **resetSeconds**: 86400



## DID

A DID is an [Identifier](https://w3c-ccg.github.io/did-spec/#decentralized-identifiers-dids) that allows you to lookup a [DID document](https://w3c-ccg.github.io/did-spec/#did-documents) that can be used to authenticate you and messages created by you.

Any Ethereum account regardless of whether it's a key pair or smart contract based is considered to be an account identifier.

An identity needs no registration.

### Controller

Each identity has a single address which maintains ultimate control over it, which is called the `controller` of the DID. By default, each identity is controlled by itself. 
As ongoing technological and security improvements occur, an owner can replace themselves with any other Ethereum address.

In this new version of smart contract it is possible to have multiple `controllers`  associated to the DID, which allows capabilities of automatic key rotation and on-chain key recovery.

Before changing to a new controller it is necessary to register it:

```solidity
addController(address identity, address controller)
```

After doing that, it is possible now to change controller by calling the following function:

```solidity
changeController(address identity, address controller)
```

Also, if you want to delete one controller, just call the next function: 

```solidity
deleteController(address identity, address controller)
```

In this last case, there are some rules to comply before deleting one controller:
 1. You cannot delete the current controller, for that case it is necessary to change to other controller
 2. You cannot delete the all controllers, you must have at least one controller associated to the DID

### Get current DID Controller 

Ownership of identity is verified by calling the function:

```solidity
identityController(address identity) public view returns(address);
``` 

This returns the address of the current DID controller.

### Setting Attributes

These attributes are set using the function:

```solidity
setAttribute(address identity, bytes32 name, bytes value, uint validity);
```

There is also a version of this function that is called with an externally created signature, that is passed to a transaction funding service.

The externally signed version has the following signature:

```solidity
setAttributeSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 name, bytes value, uint validity);
```

The signature should be signed off the keccak256 hash of the following tightly packed parameters:

`byte(0x19), byte(0), address of registry, nonce[currentOwner], identity, "setAttribute", name, value, validity`

###### Name nomenclature

The name of the attribute added to ERC1056 should follow this format:
`{type}/{controller}/{algotithm}/{enconding}`

Where `{type}` can be:
 - **vm**: for a generic Verification Method
 - **auth**: for an Authentication Method 
 - **asse**: for an Assertion Purpose
 - **keya**: for a Key Agreement
 - **dele**: for a Delegation Key
 - **invo**: for an Invocation Capability Key  
 - **svc**: for a Service

The `{controller}` represents the Verification Method controller, and can be any string DID or DID fragment.

The `{algorithm}` can be one of the following in compliant with the W3C specification https://w3c.github.io/did-spec-registries/:

- **jwk**: JsonWebKey2020,
- **esecp256k1vk**: EcdsaSecp256k1VerificationKey2019,
- **esecp256k1rm**: EcdsaSecp256k1RecoveryMethod2020,
- **edd25519vk**: Ed25519VerificationKey2018,
- **gpgvk**: GpgVerificationKey2020,
- **rsavk**: RsaVerificationKey2018,
- **x25519ka**: X25519KeyAgreementKey2019,
- **ssecp256k1vk**: SchnorrSecp256k1VerificationKey2019

And the `{enconding}` is the Public Key enconding type, the possible values are:

 - **hex**: Hexadecimal -> Produces publicKeyHex field in the DID Document 
 - **base64**: Base64 -> Produces publicKeyBase64 field in the DID Document
 - **base58**: Base58 -> Produces publicKeyBase58 field in the DID Document
 - **pem**: PEM X.509 -> Produces publicKeyPem field in the DID Document

> **Note:** The `{encoding}` only refers to the key encoding in the resolved DID document.
> Attribute values sent to the smart contract registry should always be hex encodings of the raw public key data.

###### Service Endpoints

The name of the attribute should follow this format:

`svc//{type}/hex`

Where: `{type}` is the service type field in the DID Document.

And, the `serviceEndpoint` must be in the `value` field of `setAttribute` function.

### Revoking Attributes

These attributes are revoked using the function:

```solidity
revokeAttribute(address identity, bytes32 name, bytes value);
```

There is also a version of this function that is called with an externally created signature, that is passed to a transaction funding service.

The externally signed version has the following signature:
```solidity
revokeAttributeSigned(address identity, uint8 sigV, bytes32 sigR, bytes32 sigS, bytes32 name, bytes value);
```

The signature should be signed off the keccak256 hash of the following tightly packed parameters:

`byte(0x19), byte(0), address of registry, nonce[currentOwner], identity, "revokeAttribute", name, value`

### Automatic Key Rotation

By default, is disabled for any DID the automatic key rotation. To enable this functionality for a specific account you need to execute the following smart contract method:

```solidity
enableKeyRotation(address identity, uint keyRotationTime);
```

The keyRotationTime must be greater or equal than the `minKeyRotationTime` defined in the constructor of the smart contract.

To disable the automatic key rotation, just execute the next function:

```solidity
disableKeyRotation(address identity);
```

### Key Recovery

The on-chain key recovery is one of the main features of this DID method, however it is optional and therefore we separate this functionality in a different smart contract. 
The `DIDRegistryRecoverable` is a subclass of `DIDRegistry`, and it inherits all the functionality of the base DID Registry such as the Automatic Key Rotation.

The basic operation of key recovery function consist in to prove the ownership of `n/2+1` controllers by executing the `recover` smart contract function signed by each of that controllers.

To prove the ownership of each n/2+1 controller different from the current controller of the DID, you must execute the following steps:

1. Off-chain sign the following function
   ```solidity
   recover(address identity, address controller);
   ``` 
   The signature should be generated using the keccak256 hash of the following tightly packed parameters: `byte(0x19), byte(0), address of did registry, 0, identity, "recover", controller`
2. Extract the `R`, `S`, `V` parameters of the previous signature
3. Send a transaction invoking the smart contract function
   ```solidity
   recover(address identity, v, r, s, address controller);
   ``` 
   Where, `identity` is always the original DID address and `controller` is the current controller that is trying to prove the ownership.

When it is successfully proven the ownership of `n/2+1` controllers, the current controller of the DID will be changed to the **last controller proved**.

## DID Document

The primary controller of the DID should be looked up using `identityController(identity)`. 

### Reading attributes

Attributes are stored as `DIDAttributeChanged` events. A `validTo` of 0 indicates a revoked attribute.

```solidity
event DIDAttributeChanged(
    address indexed identity,
    bytes32 name,
    bytes value,
    uint validTo,
    uint previousChange
  );
```

## Testing

First rename `truffle-config.default` to `truffle-config.js` and edit to desired network configuration.

Make sure you don't have another version of truffle installed globally, then run:

```bash
$ npm install
$ truffle test
```

### Pre requisites
- NodeJS >= 12.4
- Truffle @ 5.1.67

## Deployment

1. Install [OpenZepellin CLI](https://docs.openzeppelin.com/cli/2.7/)
2. Install [OpenZepellin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) (version 3.0.0)
3. Rename `truffle-config.default` to `truffle-config.js` and edit to desired network configuration.
4. Execute:

```bash
$ oz init
$ oz deploy
```
