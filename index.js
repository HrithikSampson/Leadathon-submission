const mongoose = require('mongoose');
const _ = require('lodash');
const express = require('express');
const app = express();
//const fetch = require('node-fetch');
//const response;
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const moves = [];
const codes = [];
let move;
const moveForCode = [];
const map = new Map();
let root = new Map();
let map1 = root;
        const url = 'https://www.chessgames.com/chessecohelp.html';
        async function scrapeData() {
                try {
                        const { data } = await axios.get(url);
    
                        const $ = cheerio.load(data);
                        const b = $("td font b");
                        
                        b.each(function(idx,el){
                                move = $(el).text();
                                //const mov = move.split();
                                /*mov.forEach((data)=>{
                                        if(Number(data)!=NaN){

                                        }
                                })*/

                                moves.push(move);
                        });
                        const equation = $("td font font");
                        
                        let map34 = map1;
                        
                        equation.each(function(idx,el){
                                move = $(el).text();
                                const mov = move.split(' ');
                                moveForCode.push(move);
                                const movement =[];
                                let i = 0;
                                map34 = map1;
                                mov.forEach(movesOn => {
                                        //console.log(mov);
                                        if(/^-?\d+$/.test(movesOn)){
                                                i++;
                                                //map34 = map1;
                                                
                                        }
                                        else{
                                                //console.log('Value');
                                                if(!map34.has(movesOn)){
                                                        map34.set(movesOn,new Map());
                                                }
                                                //console.log(map34);
                                                map34 = map34.get(movesOn);
                                        }
                                });
                                
                        })
                        const iter = $('tr td[valign="TOP"] font');
                        iter.each(function(idx,el){
                                let text = $(el).text();
                                codes.push(text);
                        })      
                        root = map1;
                                console.log('Map:',map1);  
                        //console.log(moves);
                }
                catch(err){
                        console.log(err);
                }
        }
//fetch().then((response)=>{

app.listen(2500,()=>{

        scrapeData();

        console.log("Listening on port 2500!!");
})
app.get('/Autogenerate-closest/?*',(req,res)=>{
        map1 = root;
        
        const params = req.params[0].split('/');
        //params.shift();
        console.log('params:',params);
        let b = false;
        console.log('Output:',map1.has('e4'));
        params.forEach((param)=>{
                console.log(param);
                if(!map1.has(param)){
                        if(!b)
                       return res.send("no moves found");

                        b = true;
                }
                else{
                        map1 = map1.get(param);
                }
        });
        console.log('Current map:',map1)
        var queue = [];
        let minNoMoves = Number.MAX_SAFE_INTEGER;
        let character;
        for(let [key,map2] of map1){
                console.log('key:',key);
                let noMoves = 0;
                queue.push(map2);
                queue.push(0);
                while(queue.length!==0){
                        let varv = queue.shift();
                        if(typeof varv == 'number'){
                                if(queue.length != 0)
                                        queue.push(0);
                                noMoves  = noMoves + 1;
                        }
                        else{
                                map2 = varv;
                        
                                for(let [key,value] of map2){
                                        queue.push(value);
                                }
                        }
                }
                if(minNoMoves>noMoves){
                        console.log('min found');
                        minNoMoves = noMoves;
                        character = key;
                }
        }
        console.log('char:',character);
        if(!b)
         res.send(character);
});
app.get('/*',(req,res)=>{
        let arr = req.params[0].split('/');
        if(req.params[0]===''){
                let movem = '';
                for(let i=0;i<moveForCode.length;i++){
                        movem = movem + `<font><b>${codes[i]} - ${moves[i]}</b></font><br/><p>${moveForCode[i]}</p><br/>`;
                }
                return res.send(movem);
        }
        else if(arr.length == 1){
                let idx = codes.findIndex((code)=>code===arr[0]);
                console.log(idx,',',moveForCode.length);

                return res.send(`<font><b>${moves[idx]}</b></font><br/><p>${moveForCode[idx]}</p>`);
        }
        else{
                let idx = codes.findIndex((code)=>code===arr[0]);
                let movecode = moveForCode[idx].split(' ');
                let i = 0;
                let b = false;
                console.log(movecode);
                movecode.forEach((move)=>{
                        if(!(/^-?\d+$/.test(move))){
                                
                                i++;
                                if(i>=arr.length){
                                        
                                        if(!b)
                                                return res.send(move);
                                        b = true;
                                }
                                else if(arr[i]!=move){
                                        console.log(move,',',arr[i]);
                                        if(!b)
                                                return res.send("moves didn't match");
                                        b=true;
                                }                                
                        }
                        
                })
                if(!b)
                        return res.send();
                //return res.send();
        }
})
