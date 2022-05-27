import { ethers } from 'ethers';

const _requestAccount = () => {
    return new Promise(async (resolve, reject) => {
        if(window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                resolve(accounts[0]);
            } catch (error) {
                reject('Error connecting: ' + error);
            }
        } else {
            reject('Install MetaMask to connect with DApp');
        }
    });
};

const _getProvider = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await _requestAccount();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            resolve(provider);
        } catch (error) {
            reject(error);
        }
    });
};

const _getSigner = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await _requestAccount();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            resolve(signer);
        } catch (error) {
            reject(error);
        }
    });
};

export { _getProvider, _getSigner, _requestAccount };