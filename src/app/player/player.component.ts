import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule, ButtonModule, SliderModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlayerComponent),
      multi: true
    }
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent {
  route: ActivatedRoute = inject(ActivatedRoute);

  @HostListener('window:mousemove', ['$event'])
  updateOverlay(_: MouseEvent) {
    if (this.mouseTimeout) {
      clearInterval(this.mouseTimeout);
    }
    this.showOverlay = true;
      this.mouseTimeout = setTimeout(() => {
        if (!this.videoplayer.nativeElement.paused) {
          this.showOverlay = false;
        }
      }, 2000);
  }

  @ViewChild('videoplayer')
  videoplayer!: ElementRef<HTMLVideoElement>;

  @ViewChild('progressfill')
  progressfill!: ElementRef<HTMLDivElement>;

  @ViewChild('progressbar')
  progressbar!: ElementRef<HTMLDivElement>;

  videoSrc = "";
  video_volume = 50;
  media_progress: string = '';
  media_duration: string = '';

  showOverlay: boolean;
  mouseTimeout!: ReturnType<typeof setTimeout>;

  animated_overlay_play_icon: string = 'hidden';
  animated_overlay_pause_icon: string = 'hidden';
  playpausesymbol: string = 'pi pi-play';
  mutesymbol: string = 'pi pi-volume-down';

  constructor() {
    this.videoSrc = "http://localhost:5105/Movies/stream/" + this.route.snapshot.params['id'];
    this.showOverlay = true;
  }

  togglePlay() {
    if (this.videoplayer.nativeElement.paused || this.videoplayer.nativeElement.ended) {
      this.videoplayer.nativeElement.play();
      this.animated_overlay_play_icon = 'animated-play-pause pi pi-play large-icon';
      this.animated_overlay_pause_icon = 'animated-play-pause pi pi-pause large-icon hidden';
    } else {
      this.videoplayer.nativeElement.pause();
      this.animated_overlay_play_icon = 'animated-play-pause pi pi-play large-icon hidden';
      this.animated_overlay_pause_icon = 'animated-play-pause pi pi-pause large-icon';
      this.showOverlay = true;
    }

    this.playpausesymbol = this.videoplayer.nativeElement.paused ? "pi pi-play" : "pi pi-pause";
  }

  handleVideoProgress(video: HTMLVideoElement): void {
    const progPerc = (video.currentTime / video.duration) * 100;
    this.progressfill.nativeElement.style.flexBasis = `${progPerc}%`;
    this.media_progress = this.formatMediaTimer(video.currentTime);
    this.media_duration = this.formatMediaTimer(video.duration);
  }

  padTimerZero(timer: number): string {
    return timer >= 10 ? '' : '0';
  }

  formatMediaTimer(time: number): string {
    const prog_hours = Math.floor(time / 3600);
    const prog_minutes = Math.floor(time / 60 - prog_hours * 60);
    const prog_seconds = Math.floor(time - prog_hours * 3600 - prog_minutes * 60);
    return `${this.padTimerZero(prog_hours)}${prog_hours}:${this.padTimerZero(prog_minutes)}${prog_minutes}:${this.padTimerZero(prog_seconds)}${prog_seconds}`;
  }

  scrubTime(e: MouseEvent) {
    const scrubTime = (e.offsetX / this.progressbar.nativeElement.offsetWidth) * this.videoplayer.nativeElement.duration;
    this.videoplayer.nativeElement.currentTime = scrubTime;
    this.handleVideoProgress(this.videoplayer.nativeElement);
  }

  setVolume(volume: number) {
    this.videoplayer.nativeElement.volume = (volume / 100);
    this.setVolumeSymbol();
  }

  setVolumeSymbol(): void {
    if (this.videoplayer.nativeElement.muted) {
      this.mutesymbol = 'pi pi-volume-off';
      return;
    }
    if (this.videoplayer.nativeElement.volume <= 0.5 && this.videoplayer.nativeElement.volume !== 0) {
      this.mutesymbol = 'pi pi-volume-down';
    } else if (this.videoplayer.nativeElement.volume > 0.5) {
      this.mutesymbol = 'pi pi-volume-up';
    } else {
      this.mutesymbol = 'pi pi-volume-off';
    }

  }

  toggleMute() {
    this.videoplayer.nativeElement.muted = this.videoplayer.nativeElement.muted ? false : true;
    this.setVolumeSymbol();
  }

  toggleMaximise() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  ngAfterViewInit() {
    this.videoplayer.nativeElement.addEventListener("timeupdate", _ => { this.handleVideoProgress(this.videoplayer.nativeElement); });
  }

  ngOnDestroy() {
    this.videoplayer.nativeElement.removeEventListener('timeupdate', _ => { this.handleVideoProgress(this.videoplayer.nativeElement); });
  }
}
