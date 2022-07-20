import { SoundFX } from "./SoundFX.js";

export const UI = function(app){
    app.setUIFunctions(setShields,setScore,setHighscore,youDied)
    
    // audo mixer
    var audio = new SoundFX();
  
    const fullScreenBtn = document.getElementById("fullscreenbtn");
    const gameContainer = document.getElementById("gamecont");
    const fullScreenContainer = document.getElementById("fullscreencontainer");
    const infoUI = document.getElementById("info");
    const controllsUI = document.getElementById("controlls");

    document.getElementById("interactbtn").addEventListener("click", ()=> {
        document.getElementById("interact").remove();
        SoundFX.play_action_music();
        SoundFX.play_select_btn();
        SoundFX.changeMusicVolume(SoundFX.musicVolume);
    });


    fullScreenBtn.addEventListener("click", ()=> {
        SoundFX.play_select_btn();
        fullScreen();
    });

    fullScreenBtn.addEventListener("mouseover", ()=> {
        SoundFX.play_hover_button();
    });

    document.addEventListener("keyup", keyPress);

    const menuContainer = document.getElementById("menucontainer");
    const newgameBtn = document.getElementById("newgamebtn");
    newgameBtn.addEventListener("click",  () => {
        SoundFX.play_select_btn();
        startNewGame();
    });
    newgameBtn.addEventListener("mouseover",  () => {
        SoundFX.play_hover_button();
    });
    const optionsBtn = document.getElementById("optionsbtn");
    optionsBtn.addEventListener("click", ()=> {
        SoundFX.play_select_btn();
        showOptions();
    });
    optionsBtn.addEventListener("mouseover", ()=> {
        SoundFX.play_hover_button();
    });
    
    const optionsContainer = document.getElementById("optionscontainer");
    const musicSlider = document.getElementById("musicslider");
    musicSlider.value = SoundFX.musicVolume;
    musicSlider.addEventListener("change", () => {
        SoundFX.changeMusicVolume(parseFloat(musicSlider.value));
    });
    const sfxSlider = document.getElementById("sfxslider");
    sfxSlider.value = SoundFX.SFXVolume;
    sfxSlider.addEventListener("change", () => {
        SoundFX.changeSFXVolume(parseFloat(sfxSlider.value));
    });

    const confirmBtn = document.getElementById("confirmbtn");
    confirmBtn.addEventListener("click", ()=> {
        SoundFX.play_select_btn();
        closeOptions();
    });
    confirmBtn.addEventListener("mouseover", ()=> {
        SoundFX.play_hover_button();
    });

    const mainMenuBtn = document.getElementById("mainmenubtn");
    mainMenuBtn.addEventListener("click", ()=> {
        SoundFX.play_select_btn();
        showMainMenu();
    });
    mainMenuBtn.addEventListener("mouseover", ()=> {
        SoundFX.play_hover_button();
    });

    const gameUIContainer = document.getElementById("gameuicontainer");
    const shieldsUI = document.getElementById("shields");
    const scoreUI = document.getElementById("score");
    const highscoreUI = document.getElementById("highscoreUI");

    const dieContainer = document.getElementById("diecontainer");
    const dieScore = document.getElementById("diescore");
    const dieHighscore = document.getElementById("diehighscore");
    const retryBtn = document.getElementById("retrybtn");
    retryBtn.addEventListener("click", ()=> {
        SoundFX.play_select_btn();
        startNewGame();
    });
    retryBtn.addEventListener("mouseenter", ()=> {
        SoundFX.play_hover_button();
    });
    const mainMenuBtn2 = document.getElementById("mainmenubtn2");
    mainMenuBtn2.addEventListener("click", ()=> {
        SoundFX.play_select_btn();
        showMainMenu();
    });

    mainMenuBtn2.addEventListener("mouseenter", ()=> {
        SoundFX.play_hover_button();
    });

    function fullScreen(){
        gameContainer.className="fullscreen";
        fullScreenContainer.classList.add("hidden");
        infoUI.classList.add("hidden");
        controllsUI.classList.add("hidden");
    }

    let inGame = false;

    function keyPress(e){
        if(e.key === "P" || e.key == "p"){
            if(inGame) {
                if(optionsContainer.className.includes("hidden")){
                    mainMenuBtn.classList.remove("hidden");
                    app.setPause(true);
                    optionsContainer.classList.remove("hidden");
                }else{
                    mainMenuBtn.classList.add("hidden");
                    app.setPause(false);
                    optionsContainer.classList.add("hidden");
                }
            }
        }
        else if(e.key === "H" || e.key == "h" ) {
            if(gameContainer.className==="container") fullScreen();
            else{
                gameContainer.className="container";
                fullScreenContainer.classList.remove("hidden");
                infoUI.classList.remove("hidden");
                controllsUI.classList.remove("hidden");
            }
        }
    }

    function startNewGame(){
        inGame = true;
        menuContainer.classList.add("hidden");
        dieContainer.classList.add("hidden");
        gameUIContainer.classList.remove("hidden");
        app.newGame();
    }

    function showOptions(){
        mainMenuBtn.classList.add("hidden");
        menuContainer.classList.add("hidden");
        optionsContainer.classList.remove("hidden");
    }

    function showMainMenu(){
        inGame = false;
        menuContainer.classList.remove("hidden");
        gameUIContainer.classList.add("hidden");
        optionsContainer.classList.add("hidden");
        mainMenuBtn.classList.add("hidden");
        dieContainer.classList.add("hidden")
    }

    function closeOptions(){
        if(!inGame) menuContainer.classList.remove("hidden");
        if(inGame) app.setPause(false);
        optionsContainer.classList.add("hidden");
    }

    function setShields(amount){
        let a = shieldsUI.getElementsByTagName("img");
        let count = a.length;
        while(count<amount){
            shieldsUI.innerHTML+='<img src="resources/shield.png" id="shield'+count+'">';
            count++;
        }
        while(count>amount && amount>-1){
            count--;
            a["shield"+count].remove();
        }
    }

    function setScore(score){
        scoreUI.innerHTML = score;
    }

    function setHighscore(score){
        highscoreUI.innerHTML = score;
    }

    function youDied(){
        gameUIContainer.classList.add("hidden");
        dieScore.innerHTML = scoreUI.innerHTML;
        dieHighscore.innerHTML = highscoreUI.innerHTML;
        dieContainer.classList.remove("hidden");
        SoundFX.play_game_over();
    }

}