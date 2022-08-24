import fs from "fs";
import path from "path";
import ethers from "ethers";
import lacnet from "@lacchain/gas-model-provider";

const provider = new lacnet.GasModelProvider( 'http://localhost:4545' );
const privateKey = "8b2c4ca73a4ce874432997a1a0851ff11283996f512b39f2640d009d8dc8b408";
const nodeAddress = "0x211152ca21d5daedbcfbf61173886bbb1a217242";
const expiration = 1836394529;
const signer = new lacnet.GasModelSigner( privateKey, provider, nodeAddress, expiration );

const deployDIDRegistry = async() => {
	const DIDRegistryBuild = fs.readFileSync( path.resolve() + '/build/contracts/DIDRegistry.json' );
	const DIDRegistryJSON = JSON.parse( DIDRegistryBuild.toString() );
	const DIDRegistry = new ethers.ContractFactory( DIDRegistryJSON.abi, DIDRegistryJSON.bytecode, signer );
	const didRegistry = await DIDRegistry.deploy( 3600, { gasLimit: 11500000, gasPrice: 0 } );
	const receipt = await didRegistry.deployTransaction.wait();
	const contractAddress = receipt.contractAddress;
	console.log( 'DIDRegistry:', contractAddress );
}

const deployDIDRegistryRecoverable = async() => {
	const DIDRegistryRecoverableBuild = fs.readFileSync( path.resolve() + '/build/contracts/DIDRegistryRecoverable.json' );
	const DIDRegistryRecoverableJSON = JSON.parse( DIDRegistryRecoverableBuild.toString() );
	const DIDRegistryRecoverable = new ethers.ContractFactory( DIDRegistryRecoverableJSON.abi, DIDRegistryRecoverableJSON.bytecode, signer );
	const didRegistryRecoverable = await DIDRegistryRecoverable.deploy( 3600, 3, 5, 86400, { gasLimit: 11500000, gasPrice: 0 } );
	const receipt = await didRegistryRecoverable.deployTransaction.wait();
	const contractAddress = receipt.contractAddress;
	console.log( 'DIDRegistryRecoverable:', contractAddress );
}

deployDIDRegistry().catch( console.error );
deployDIDRegistryRecoverable().catch( console.error );