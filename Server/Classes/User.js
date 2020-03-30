let shortID = require('shortid');

module.exports = class User {
    constructor() {
        this.username = 'Non_member'; // 로그인하면 바꿔야함
        this.id = shortID.generate(); // 로그인하면 바꿔야함
        this.lobby = 0;
    }
    copyUserInfo(user = User){
        this.username = user.username;
        this.id = user.id;
        this.lobby = user.lobby;
    }

    displayUserInformation() {
        let user = this;
        return '(' + user.username + ':' + user.id + ')';
    }

    showUserData() {
        console.log(JSON.stringify(this));
    }
}