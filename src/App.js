import './App.css';
import { useEffect, useState } from "react"
import { Button, TextField } from '@material-ui/core';
import * as md5 from "md5"
import { parseContent } from "osu-parser"
import { post } from "axios"

const xToTrackMap = {
  64: 1,
  192: 2,
  320: 3,
  448: 4
}

function mockDifficulties() {
  let mock = []

  for (let i = 0; i < 14; i++)
    mock.push({
      Overall: 0,
      Chordjack: 0,
      Handstream: 0,
      Jack: 0,
      Jumpstream: 0,
      Stamina: 0,
      Stream: 0,
      Technical: 0,
      Rate: (i + 7) * 10,
    })

  return mock
}

function App() {
  const [ osuText, setOsuText ] = useState("")
  const [ conversion, setConversion ] = useState("")
  const [ assetId, setAssetId ] = useState(0)
  
  return (
    <div className="App">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <div>
  		  <TextField helperText={".osu file input"} style = {{width: "40%"}} multiline value={osuText} rows={20} onChange={(event) => setOsuText(event.target.value)}/>
        <div>
          <TextField helperText={"Asset Id"} style = {{width: "20%"}} value={assetId} rows={20} onChange={(event) => setAssetId(event.target.value)}/>
        </div>
      </div>
      <div>
        <Button color="primary" onClick={async () => {
          const data = parseContent(osuText)
          let out = {
            "AudioArtist": data.Artist,
            "AudioFilename": data.Title,
            "AudioDifficulty": 1,
            "AudioMapper": data.Creator,
            "AudioVolume": 0.5,
            "AudioTimeOffset": -75,
            "AudioAssetId": `rbxassetid://${assetId}`,
            "AudioCoverImageAssetId": "",
            "AudioDescription": "",
            "AudioHitSFXGroup": 0,
            "AudioMod": 0,
            "AudioNotePrebufferTime": 1000,
            "HitObjects": []
          }

          data.hitObjects.forEach(hitObject => {
            switch (hitObject.objectName) {
              case "circle":
                out.HitObjects.push({
                  "Type": 1,
                  "Time": hitObject.startTime,
                  "Track": xToTrackMap[hitObject.position[0]]
                })
                break
              case "slider":
                out.HitObjects.push({
                  "Type": 2,
                  "Time": hitObject.startTime,
                  "Track": xToTrackMap[hitObject.position[0]],
                  "Duration": hitObject.endTime - hitObject.startTime
                })
                break
              default:
                break
            }
          })

          const difficulties = await post("https://diff.regenerate.repl.co", out)

          out.AudioDifficulty = difficulties ? difficulties.data : mockDifficulties()

          const hitObjectJsonString = JSON.stringify(out.HitObjects)
          const audioMD5Hash = md5(hitObjectJsonString)

          out.AudioMD5Hash = audioMD5Hash

          setConversion(JSON.stringify(out, null, 2))
        }}>CONVERT</Button>
      </div>
      <div>
		    <TextField helperText={"JSON output"} style = {{width: "40%"}} multiline rows={20} value={conversion}></TextField>
      </div>
    </div>
  );
}

export default App;
