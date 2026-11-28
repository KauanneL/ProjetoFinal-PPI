import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PainelApoio } from './painel-apoio';

describe('PainelApoio', () => {
  let component: PainelApoio;
  let fixture: ComponentFixture<PainelApoio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelApoio],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelApoio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
