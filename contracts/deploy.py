from pyteal import *
from split_bill import app
import beaker

def deploy():
    # Use sandbox or testnet
    client = beaker.sandbox.get_algod_client()
    accts = beaker.sandbox.get_accounts()
    
    app_client = beaker.client.ApplicationClient(
        client, app, signer=accts[0].signer
    )
    
    app_id, app_addr, txid = app_client.create()
    print(f"Created App with ID: {app_id} and Address: {app_addr}")
    
    # Fund the app account with 1 ALGO
    app_client.fund(1_000_000)
    print("Funded App with 1 ALGO")

if __name__ == "__main__":
    deploy()
