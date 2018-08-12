import {Table, Button, Form} from 'react-bootstrap';
import React, {Component} from 'react';
import axios from 'axios';
import FileDownload  from 'react-file-download';
//import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';



class App extends Component {

    state = {
        ipfsHash: null,
        buffer: '',
        ethAddress: '',
        blockNumber: '',
        transactionHash: '',
        gasUsed: '',
        txReceipt: '',
        nodeAddress: '',
        hashId : '',
        timestamp: '',
        commonName:'',
        countryName:'',
        stateName:'',
        cityName:'',
        organizationName:'',
        organizationUnit:'',
        publicKey:''
    };

    constructor(){
        super();

        storehash.events.NewHashStored()
            .on('data', event => {
                this.state.hashId = event.returnValues.hashId;
                this.state.timestamp = event.returnValues.timestamp;
            })
            .on('error', console.error);
    }

    generateCertificate = async (event) =>{
        event.preventDefault();
        let attrs =  [{
            name: 'commonName',
            value: this.state.commonName
        }, {
            name: 'countryName',
            value: this.state.countryName
        }, {
            shortName: 'ST',
            value: this.state.stateName
        }, {
            name: 'localityName',
            value: this.state.cityName
        }, {
            name: 'organizationName',
            value: this.state.organizationName
        }, {
            shortName: 'OU',
            value: this.state.organizationUnit
        }];

        let address = this.state.nodeAddress;

        let publicKey = this.state.publicKey;

        let options = {
            attrs: attrs,
            address: address,
            publicKey: publicKey
        };
        axios.post('/api/certificate', options)
            .then(response => {
                console.log(response);
                FileDownload(response.data, this.state.nodeAddress + '.pem');
            })
            .catch(error=> console.log(error));

    };

    captureFile = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const file = event.target.files[0];
        let reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => this.convertToBuffer(reader)
    };

    convertToBuffer = async (reader) => {
        //file is converted to a buffer to prepare for uploading to IPFS
        const buffer = await Buffer.from(reader.result);
        this.setState({buffer});
    };

    onClick = async () => {
        try {
            this.setState({blockNumber: "waiting.."});
            this.setState({gasUsed: "waiting..."});

            // get Transaction Receipt in console on click
            // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
            await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
                console.log(err, txReceipt);
                this.setState({txReceipt});
            }); //await for getTransactionReceipt

            await this.setState({blockNumber: this.state.txReceipt.blockNumber});
            await this.setState({gasUsed: this.state.txReceipt.gasUsed});
        } //try
        catch (error) {
            console.log(error);
        } //catch
    }; //onClick

    updateInputValue(e, field) {
        this.setState({[field]: e.target.value});
    }

    onSubmit = async (event) => {
        event.preventDefault();

        //bring in user's metamask account address
        const accounts = await web3.eth.getAccounts();

        console.log('Sending from Metamask account: ' + accounts[0]);

        //obtain contract address from storehash.js
        const ethAddress = await storehash.options.address;
        this.setState({ethAddress});

        //save document to IPFS,return its hash#, and set hash# to state
        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err, ipfsHash);
            //setState by setting ipfsHash to ipfsHash[0].hash
            this.setState({ipfsHash: ipfsHash[0].hash});

            // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
            //return the transaction hash from the ethereum contract
            //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send

            storehash.methods.saveCertificate(this.state.nodeAddress, this.state.ipfsHash).send({
                from: accounts[0]
            }, (error, transactionHash) => {
                console.log(transactionHash);
                this.setState({transactionHash});
            }); //storehash
        }) //await ipfs.add
    }; //onSubmit 

    render() {

        return (
            <div className="App">
                <header className="App-header">
                    <h1> Certificate Authority</h1>
                </header>

                <hr/>

                <section className="top-container">
                    <div className="left-half">
                        <div>
                            <h3> Choose Certificate</h3>
                            <Form onSubmit={this.onSubmit}>
                                <input type="text" className="pure-input-1-1" placeholder="Enter Node Address"
                                       value={this.state.nodeAddress} onChange={e => this.updateInputValue(e, 'nodeAddress')}/>
                                <br/>
                                <br/>
                                <input
                                    type="file"
                                    onChange={this.captureFile}
                                />
                                <Button
                                    bsStyle="primary"
                                    type="submit">
                                    Send it
                                </Button>
                            </Form>

                            <hr/>
                            <Button onClick={this.onClick}> Get Transaction Receipt </Button>

                            <Table bordered responsive>
                                <thead>
                                <tr>
                                    <th>Tx Receipt Category</th>
                                    <th>Values</th>
                                </tr>
                                </thead>

                                <tbody>
                                <tr>
                                    <td>IPFS Hash # stored on Eth Contract</td>
                                    <td><a className="submission-hash-content" target="_blank"
                                           href={`https://ipfs.infura.io:5001/api/v0/cat/${this.state.ipfsHash}`}>{this.state.ipfsHash}</a></td>
                                </tr>
                                <tr>
                                    <td>Ethereum Contract Address</td>
                                    <td>{this.state.ethAddress}</td>
                                </tr>

                                <tr>
                                    <td>Tx Hash #</td>
                                    <td>{this.state.transactionHash}</td>
                                </tr>

                                <tr>
                                    <td>Node Address</td>
                                    <td>{this.state.nodeAddress}</td>
                                </tr>

                                <tr>
                                    <td>Hash Id</td>
                                    <td>{this.state.hashId}</td>
                                </tr>

                                <tr>
                                    <td>Timestamp </td>
                                    <td>{this.state.timestamp}</td>
                                </tr>
                                <tr>
                                    <td>Block Number #</td>
                                    <td>{this.state.blockNumber}</td>
                                </tr>

                                <tr>
                                    <td>Gas Used</td>
                                    <td>{this.state.gasUsed}</td>
                                </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <div className="right-half">
                        <div>
                            <h3> Sign Certificate</h3>
                            <Form onSubmit={this.generateCertificate}>
                                <input type="text" className="pure-input-1-1" placeholder="Enter Node Address"
                                       value={this.state.nodeAddress} onChange={e => this.updateInputValue(e, 'nodeAddress')}/>
                                <br/>
                                <br/>
                                <input type='text' placeholder='Common Name' value={this.state.commonName}
                                       onChange={e=> this.updateInputValue(e, 'commonName')} />
                                <br/>
                                <br/>
                                <input type='text' placeholder='Country Name (2 Letters e.g. US)'  value={this.state.countryName}
                                       onChange={e=> this.updateInputValue(e, 'countryName')}/>
                                <br/>
                                <br/>
                                <input type='text' placeholder='State Name'  value={this.state.stateName}
                                       onChange={e => this.updateInputValue(e, 'stateName')} />
                                <br/>
                                <br/>
                                <input type='text' placeholder='City Name' value={this.state.cityName}
                                       onChange={event => this.updateInputValue(event, 'cityName')}/>
                                <br/>
                                <br/>
                                <input type='text' placeholder='Organization Name'  value={this.state.organizationName}
                                        onChange={e => this.updateInputValue(e, 'organizationName')}/>
                                <br/>
                                <br/>

                                <input type='text' placeholder='Organization Department Name'  value={this.state.organizationUnit}
                                       onChange={e => this.updateInputValue(e, 'organizationUnit')}/>
                                <br/>
                                <br/>

                                ​<textarea id="txtArea" rows="10" cols="70" placeholder='public key'
                                           value={this.state.publicKey} onChange={e=> this.updateInputValue(e,'publicKey')} />
                                <br/>
                                <Button
                                    bsStyle="primary"
                                    type="submit">
                                    Generate Certificate
                                </Button>
                            </Form>
                        </div>
                    </div>
                </section>

            </div>
        );
    } //render
}

export default App;


/**
 * Signing offline By CA.
 */
