const express = require("express")
const app = express();
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")

const path = require("path")
module.exports = app;
app.use(express.json());
const CricketPath = path.join(__dirname, "cricketMatchDetails.db")

let db  = null;

const InitializationDBtoServer = async() =>{
    try{
    db = await open({
    filename: CricketPath,
    driver: sqlite3.Database,
});
app.listen(3000, ()=>
    console.log("Server is running at https://localhost:3000/")
);
}catch(e){
    console.log(`DBError: ${e.message}`)
    process.exit(1)
};
}

InitializationDBtoServer();

const player = (dbobject) =>{
    return {
        playerId: dbobject.player_id,
        playerName: dbobject.player_name,        
    }
      
 }

const match = (dbobject) =>{
    return{
        matchId:dbobject.match_id,
        match:dbobject.match,
        year:dbobject.year,        
    }
}

const playerMatchDetails = (dbobject)=>{
    return{
    playerMatchId:dbobject.player_match_id,
    playerId:dbobject.player_id,
    matchId:dbobject.match_id,
    score:dbobject.score,
    fours:dbobject.fours,
    sixes:dbobject.sixes,        
    }
}


app.get("/players/", async (request,response) =>{
    const getPlayers = `SELECT * FROM player_details;`;
    const result = await db.all(getPlayers)  
    response.send(result.map((each) => player(each)))                 
})

app.get("/players/:playerId/", async (request,response) =>{
    const{playerId} = request.params;
    const getQuery =`SELECT * FROM player_details WHERE player_id = ${playerId};`
    const getplayer = await db.get(getQuery);
    response.send(player(getplayer))        
})


app.get("/matches/:matchId/",async (request,response) =>{
    const {matchId} = request.params;
    const getMatch = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
    const result = await db.get(getMatch);
    response.send(match(result))
})


app.put("/players/:playerId/", async (request,response) =>{
    const {playerName} = request.body;
    const{playerId} = request.params;
    const PutQuery = `UPDATE player_details SET
                        player_name = '${playerName}'
                        WHERE player_id = ${playerId};`;
    await db.run(PutQuery);
    response.send("Player Details Updated")
})


app.get("/players/:playerId/matches", async (request,response) =>{
    const {playerId} = request.params;
    const query = `SELECT * FROM match_details Natural join player_match_score WHERE
         player_id = ${playerId};`;
    const getresult = await db.all(query);
    response.send(getresult.map((each) => ({matchId:each.match_id,
                                        match:each.match,
                                        year:each.year})))
 })


 app.get("/matches/:matchId/players", async(request,response) =>{
    const {matchId} = request.params;
    const result = `SELECT * FROM player_details Natural join player_match_score
            WHERE match_id = ${matchId};`;
    const playerDetails = await db.all(result)
    response.send(playerDetails.map((each) => ({playerId: each.player_id,
                                        playerName:each.player_name})))

         
 })

app.get("/players/:playerId/playerScores", async (request,response) =>{
    const{playerId} = request.params;
    const score = `SELECT player_id, player_name, sum(score) as totalScore,
                    sum(fours) as totalFours, sum(sixes) as totalSixes  FROM player_details Natural join player_match_score WHERE
                player_id = ${playerId};`;
    const totalResult = await db.get(score);
    response.send({playerId:totalResult.player_id,
        playerName:totalResult.player_name,
        totalScore:totalResult.totalScore,
        totalFours:totalResult.totalFours,
        totalSixes:totalResult.totalSixes})         
})
