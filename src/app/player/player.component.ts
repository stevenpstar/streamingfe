import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import {MatSliderModule} from '@angular/material/slider';
import { MovieService } from '../movie.service';
import { ActorDTO } from '../types/ActorDTO';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-player',
  imports: [CommonModule, FormsModule, ButtonModule, SliderModule, MatIconModule, MatSliderModule],
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
  movieService: MovieService = inject(MovieService);

  @HostListener('window:mousemove', ['$event'])
  updateOverlay(e: MouseEvent) {

    document.body.style.cursor = "default";
    if (this.mouseTimeout) {
      clearInterval(this.mouseTimeout);
    }

    if (e.target === this.progressbar.nativeElement ||
        e.target === this.progressfill.nativeElement ||
       e.target === this.progresstracker.nativeElement ||
       this.draggingScrubber) {
      this.displayThumbnail(e.clientX);
    } else {
      this.hideThumbnail();
    }

    this.showOverlay = true;
      this.mouseTimeout = setTimeout(() => {
        if (!this.videoplayer.nativeElement.paused) {
          this.showOverlay = false;
          document.body.style.cursor = "none";
        }
      }, 2000);

    if (this.draggingScrubber) {
        this.scrubTime(e);
    }
  }

  @HostListener('window:mouseup', ['$event'])
  mouseUp(e: MouseEvent) {
    if (this.draggingScrubber) {
      this.draggingScrubber = false;
      this.scrubTime(e);
    }
  }

  @ViewChild('videoplayer')
  videoplayer!: ElementRef<HTMLVideoElement>;

  @ViewChild('progressfill')
  progressfill!: ElementRef<HTMLDivElement>;

  @ViewChild('progressbar')
  progressbar!: ElementRef<HTMLDivElement>;

  @ViewChild('progressTracker')
  progresstracker!: ElementRef<HTMLDivElement>;

  @ViewChild('thumbnailWrapper')
  thumbnailWrapper!: ElementRef<HTMLDivElement>;

  @ViewChild('dimOverlay')
  dimOverlay!: ElementRef<HTMLDivElement>;

  @ViewChild('castOverlay')
  castOverlay!: ElementRef<HTMLDivElement>;

  videoSrc = "";
  video_volume = 50;
  media_progress: string = '';
  media_duration: string = '';
  thumbnails: string[] = [];
  thumbnail: string = "";
  hoverTime: string = "";
  cast: ActorDTO[] = [];

  showOverlay: boolean;
  draggingScrubber: boolean = false;
  mouseTimeout!: ReturnType<typeof setTimeout>;

  animated_overlay_play_icon: string = 'hidden';
  animated_overlay_pause_icon: string = 'hidden';
  playpausesymbol: string = 'pi pi-play';
  mutesymbol: string = 'volume_down';

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
    const scrubTime = (e.clientX / this.progressbar.nativeElement.offsetWidth) * this.videoplayer.nativeElement.duration;
    this.videoplayer.nativeElement.currentTime = scrubTime;
    this.handleVideoProgress(this.videoplayer.nativeElement);
  }

  displayThumbnail(offset: number): void {
    const scrubTime = (offset / this.progressbar.nativeElement.offsetWidth) * this.videoplayer.nativeElement.duration;
    this.hoverTime = this.formatMediaTimer(scrubTime);
    let position: number = offset - 100;
    if (position <= 0) {
      position = 0;
    }
    if (position + 200 > this.progressbar.nativeElement.getBoundingClientRect().width) {
      position = this.progressbar.nativeElement.getBoundingClientRect().width - 200;
    }
    this.thumbnailWrapper.nativeElement.classList.remove("hidden");
    this.thumbnailWrapper.nativeElement.style.left = `${position}px`;
    const incr = this.progressbar.nativeElement.getBoundingClientRect().width / this.thumbnails.length;
    this.thumbnail = `data:image/png;base64,${this.thumbnails[Math.floor(offset / incr)]}`;
  }

  hideThumbnail(): void {
    if (this.thumbnailWrapper.nativeElement === null) {
      return;
    }
    this.thumbnailWrapper.nativeElement.classList.add("hidden");
  }

  dragTime(e: MouseEvent): void {
    e.preventDefault();
    this.draggingScrubber = true;
  }

  setVolume() {
    let volume = this.video_volume;
    this.videoplayer.nativeElement.volume = (volume / 100);
    this.setVolumeSymbol();
  }

  setVolumeSymbol(): void {
    if (this.videoplayer.nativeElement.muted) {
      this.mutesymbol = 'volume_off';
      return;
    }
    if (this.videoplayer.nativeElement.volume <= 0.5 && this.videoplayer.nativeElement.volume !== 0) {
      this.mutesymbol = 'volume_down';
    } else if (this.videoplayer.nativeElement.volume > 0.5) {
      this.mutesymbol = 'volume_up';
    } else {
      this.mutesymbol = 'volume_mute';
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
    this.movieService.getThumbnails(this.route.snapshot.params['id']).subscribe(
      thumbs_res => {
        this.thumbnails = thumbs_res;
      }
    );
    this.movieService.getCast(this.route.snapshot.params['id']).subscribe(
      cast_res => {
        this.cast = cast_res;
        console.log(this.cast);
      }
    );
    this.handleVideoProgress(this.videoplayer.nativeElement);
  }

  ngOnDestroy() {
    this.videoplayer.nativeElement.removeEventListener('timeupdate', _ => { this.handleVideoProgress(this.videoplayer.nativeElement); });
  }
}
