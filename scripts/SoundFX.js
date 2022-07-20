/**
 * This class is used for sound affects. It requires no arguments. The directories are hardcoded into the class.
 *
 */
export class SoundFX {
    static musicVolume = localStorage.getItem('musicVolume') || 0.3;
    static SFXVolume = localStorage.getItem('SFXVolume') || 0.3;

    static laser_shot = new Audio("./soundFX/laser_shot_1.wav");
    static explosion = new Audio("./soundFX/short_explosion.wav");
    static action_music = new Audio("./soundFX/actionMusic.mp3");
    static select_btn = new Audio("./soundFX/select.mov");
    static hover_btn = new Audio("./soundFX/hover.wav");
    static ship_hit = new Audio("./soundFX/ship_hit.wav");
    static diamond_hit = new Audio("./soundFX/diamond.wav");
    static shield_hit = new Audio("./soundFX/shield.wav");
    static game_over = new Audio("./soundFX/game-over.wav")

    static changeMusicVolume(volume){
        localStorage.setItem('musicVolume',volume)
        SoundFX.action_music.volume = volume;
    }

    static changeSFXVolume(volume){
        localStorage.setItem('SFXVolume',volume)
        SoundFX.SFXVolume = volume;
    }

    // kloniranje ne klonira glasnosti.........................
    static play(sfx){
        const temp = sfx.cloneNode(true)
        temp.volume = SoundFX.SFXVolume;
        temp.play()
    }

    /**
     * play_boom() method plays an explosion sound.
     */
    static play_boom() {
        SoundFX.play(SoundFX.explosion)
    }

    /**
     * play_laser_shot() method plays a laser shot sound.
     */
    static play_laser_shot() {
        SoundFX.play(SoundFX.laser_shot)
    }


    /**
     * plays action music.
     */
    static play_action_music() {
        SoundFX.action_music.loop = true;
        SoundFX.action_music.play();
    }

    /**
     * stops action music
     */
    static stop_action_sound() {
        SoundFX.action_music.pause();
    }

    /**
     * plays sound of button press.
     */
    static play_select_btn() {
        SoundFX.play(SoundFX.select_btn);
    }

    /**
     * plays sound hovering over btn.
     */
    static play_hover_button() {
        SoundFX.play(SoundFX.hover_btn);
    }

    /**
     * plays sound of ship being hit
     */
    static play_ship_hit() {
        SoundFX.play(SoundFX.ship_hit);
    }

    /**
     * plays sound of collecting diamond
     */
    static play_diamond_hit() {
        SoundFX.play(SoundFX.diamond_hit);
    }

    /**
     * plays sound of collecting shield
     */
     static play_shield_hit() {
        SoundFX.play(SoundFX.shield_hit);
    }

    /**
     * plays game over sound
     */
    static play_game_over() {
        SoundFX.play(SoundFX.game_over);
    }
}
