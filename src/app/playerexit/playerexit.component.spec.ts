import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerexitComponent } from './playerexit.component';

describe('PlayerexitComponent', () => {
  let component: PlayerexitComponent;
  let fixture: ComponentFixture<PlayerexitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerexitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerexitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
