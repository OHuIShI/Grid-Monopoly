//let Blockchain = require('./blockchain.js');
import { createGenesisBlock, generateNextBlock } from './blockchain.js';
let Connection = require('../Classes/Connection.js');
module.exports = class BlockManager {
    constructor(connections = Connection, gameLobbyID) {
        this.gameLobbyID = gameLobbyID
    }

    // GenesisBlock 생성 함수
    
    createGenesis()
    {
        
        let genesisBlock = createGenesisBlock(this.gameLobbyID);
        console.log(genesisBlock);
        return genesisBlock;
    }
    createNewBlock(eventName, eventResult){
        let blockData = {
            eventName: eventName,
            eventResult: eventResult
        }
        let newBlock = generateNextBlock(blockData, this.gameLobbyID);
        // the end? maybe
        // 얘를 이제 게임로비에서 불러야돼
        return newBlock;
    }
    // 채팅창
    /*
    원래(라고 하기는 뭐하지만) 그 이 원본 소스코드에서는 블록을 만들고 그걸 chain에 add 한 다음에 
    애색기들한테 야 블록 생성도ㅒㅆ다! 까지를 blockchain.js에서 했었음  <- 이색기 때문에 그래
    그래서 얘가 블록만 만들고 emit을 이이잉 음.... 

    1. 원래 애색기가 했던 것 처럼 블록체인(매니저에서?)에서 블록 생성 & 각 사람한테 블록 생성 알리기(우리로 치면 emit)
    2. 블록매니저는 공장처럼 블록체인 만들기만 하고 만든 블록을 게임로비에 던져줘서 emit은 게임로비가

    1이냐 2냐 그것이 문제로다 민주적으로 투표 가자
    다수결에 의해 2로 결정되ㄱ습니다
    그럼 공장식으로 찍는걸 하나만 만들면 되나?

    근데 저거 createGenesis에는 뭐 안들어가도 돼? 저거 lobbyUpdate returnData로 들어가는거 아닌가
    lobbyUpdate 할 때 넣는 데이터가 뭔지 아십니까?
    GAME.
    스트링 이게 끝입니다. 존나 쓸모업서요 블록에 안 넣어도돼 아 근데 시발
    무조건 블록을 보내야하는겆.......?에반데?.................그냥 따로 안돼?ㅎㅎ 중요한 게임데이터도 아냐
    게임 데이터라기보다는 그냥 게임 세팅과 관련된 거라 약간 블록체인에 넣ㄱ기가 좀 그래....ㅠㅜOTL..
    따로 가도 돼...............가야지 ㄱ yeah 걍 데이터만 던져서 블록으로 만들어서 주면 돼!! 라벨만 붙이고
    그런셈이지 호엥? 그런가???????????????????? emit이 중요한게 아니라 걍 블록에들어가느 ㄴ데이터?
    "누가"=> 얘를 gameLobby에서 returnData에 포함시키면 eva인가 주사위 몇개 나왔다. 거래내역 마냥 이런걸 적어둬야하는게 아닌지....? 원래도 있나?
    있을거같은데 그런 id 필요한것들은 어차피 다 있긴 하네 걍 data랑 그 이벤트 이름을 받아와서 라벨을 붙여줘야할듯
    블록만들면서 그니까 블록이 예를들어 이렇게 되는거지 
    블록의 데이터는..,
    data : {
        eventName: " ",
        eventResult: {
            여기 이제 받아온 returnData?
        }
    }
그렇지
    그럼 게임로비에서 저 createNewBlock 부를 때는 returnData랑 자기 event 이름 넣어주면 되네
    그거 그대로 걍 실질적으로 블록체인 만드는 blockchain.js에 넘기면 되지 않아? block class 속성을 좀 바꾸면 될것같음
    나IS 이이잉? 리턴로비데이터를 쓰긴 하지? 그러니 보내지..?
    어으음 좀 자잘하고 게임데이터는 아니야 직접적인.., 걍..시그널 같은거라..
    근데 생각해보니까 클라에서 모든 소켓이벤트 처릴를 블록을 이용해서 하는거 ㄴ아닐거아냐.? 블록은 게임 시작하고 만드어지니까? 
    !! 클라에서 소켓이벤트별로 처리하는 방법을 다르게 해도 되지 않을까? !!
    로비업데이트 이런건 솔직히...게임데이터가..아니라서..구딩 넣고싶지가 않아

    
    그럼 블록 보내서 까보는거 해야하나
    근데 이제 계속 서버에서는 블록으로 데이터를 줘야하잖아 수빌ㅇ렁ㄹ
    으음ㅇㅁ 그럼 그 다음것들 이제 해야하는건가 그냥 저 createNewblock 함수만 만들면 끝인거같은데 다음 이야기..^^
    
    아니 근데 저걸 어떻게 파일로 저장하지 블럭 ㄴ만들때마다 txt에 기록해서 남겨야함?

    그냥 제네시스블록 만들때 쳐넣을까? 거기에다..게임세팅..정보를..엉
    어차피 제네시스 블록에 지금 ㅜ머 내용도 없고
    ?? 왜 멈춰있나요
    enteredgame이 gamescene 로딩되엇다라는 신호일걸
    게임씬 로딩 다하고 세팅하려고 그랫던거
    걍 제네시스에 쳐넣자!!loadGame을 에밋하는 저기가 걍 게임 스타트!야           
    
    근데 이게 애매한게 우리가 게임 초기 세팅을 한번에 파바박 하나? ?? ??
    이게 그냥 플레이어가 게임방에 들어왔다! 하면 일단 세팅하고 기
    */
    
}                   