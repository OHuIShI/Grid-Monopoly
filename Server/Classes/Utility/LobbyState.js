module.exports = class LobbyState {
    constructor(maxPlayers) {
        //Predefined States
        this.GAME = 'Game';
        this.LOBBY = 'Lobby';
        this.ENDGAME = 'EndGame';

        //Current state of the lobby
        // 나중에 GameLobby 말고 게임 첫 시작화면일 때를 LOBBY로 하고, 게임로비 들어가면 GAMELOBBY로 하는게 나을 듯 -> 유니티 GameLobby.cs 수정 필요
        this.currentState = this.LOBBY;

        //Ready States
        this.readyStates = new Array(maxPlayers);

        for(let i=0;i<maxPlayers;i++){
            this.readyStates[i] = false;
        }
    }
}