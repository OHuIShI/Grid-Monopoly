using Project.Utility;
using SocketIO;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
namespace Project.BlockChain
{
    public class BlockChainManager : MonoBehaviour
    {
        [Serializable]
        public class Block
        {
            public int index;
            public string hash;
            public string previousHash;
            public double timestamp;
            public Data data;
            // 새롭게 추가되었다. 새롭게 block 의 요소로 추가되었다. 
            public int difficulty;
            public int nonce;
        }

        [Serializable]
        public class Data
        {
            public string eventName;
            public JSONObject eventData;
        }

        //public Block[] blockchain;
        public static List<Block> blockchain = new List<Block>();

        public static void SetGenesis(SocketIOEvent E)
        {
            Debug.Log("[ Start ] SetGenesis");
            MakeBlock(E);
            Debug.Log("[ Done ] SetGenesis");
        }
        
        private static void MakeBlock(SocketIOEvent E) 
        {
            Debug.Log("[ Start ] MakeBlock");
            Block block = new Block();
            block.index = Int32.Parse(E.data["index"].ToString().RemoveQuotes());
            block.hash = E.data["hash"].ToString().RemoveQuotes();
            block.previousHash = E.data["previousHash"].ToString().RemoveQuotes();
            block.timestamp = Double.Parse(E.data["timestamp"].ToString().RemoveQuotes());

            Data eData = new Data();
            eData.eventName = E.data["data"]["eventName"].ToString().RemoveQuotes();
            eData.eventData = E.data["data"]["eventResult"];
            block.data = eData;

            block.difficulty = Int32.Parse(E.data["difficulty"].ToString().RemoveQuotes());
            block.nonce = Int32.Parse(E.data["nonce"].ToString().RemoveQuotes());

            blockchain.Add(block);
            Debug.Log("[ Done ] MakeBlock");
        }

        public static Data SetNextBlock(SocketIOEvent E)
        {
            MakeBlock(E);
            return GetLatestBlockData();
        }

        public static Data GetLatestBlockData()
        {
            Debug.Log("[ Start ] GetLatestBlockData");
            Block latestBlock = blockchain[blockchain.Count - 1];
            Debug.Log("[ Done ] GetLatestBlockData");
            return latestBlock.data;
        }

        // 나중에 게임 한 판 끝났을 때 chain에 있는거 어떻게 싹(저장) 하고 blockchain 리스트 비우는 함수
        public void ClearChain()
        {
            // 모바일에 파일로 저장

            // blockchain 리스트 비우기
            blockchain.Clear();
        }
    }
}