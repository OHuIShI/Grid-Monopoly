let Vector2 = require('./Vector2.js');
let User = require('./User');

module.exports = class Player extends User {
    constructor(user = User) {
        super();
        this.copyUserInfo(user);
        this.order = -1;
        this.position = new Vector2();
        this.isMyTurn = false;
        this.dirDice = new Number(0); // player가 굴린 방향주사위 눈
        this.distDice = new Number(0); // 방향주사위 눈
        this.dist = new Number(0); // player의 남은 이동 횟수
        this.balance = new Number(0);
        this.assets = new Number(0);
    }

    IsMyTurn() {
        return this.isMyTurn;
    }

    SetIsMyTurn(nextTurn = Boolean) {
        this.isMyTurn = nextTurn;
    }

    updatePosition(data) {
        // hoxy 몰라서 체크 한번..나중에 지워도 됨
        if(data.id!== this.id){
            console.log('different id!');
        }
        //console.log(data.DIR);
        this.position.x = data.x;
        this.position.y = data.y;
        this.dirDice = data.DIR;
        this.distDice = data.DIST;
        this.dist = data.dist;
    }

    showPlayerData() {
        super.showUserData();
        console.log(JSON.stringify(this));
    }
}