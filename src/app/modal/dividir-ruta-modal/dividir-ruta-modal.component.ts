import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, cutOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dividir-ruta-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="warning">
        <ion-title>✂️ Dividir Ruta</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="contenido-modal">
        
        <!-- INFORMACIÓN -->
        <div class="info-section">
          <div class="dia-badge">
            <ion-icon name="calendar-outline"></ion-icon>
            <strong>{{ diaSemana }}</strong>
          </div>
          
          <h3>Divide la ruta en 2 grupos</h3>
          <p class="descripcion">
            Total de clientes: <strong>{{ totalClientes }}</strong>
          </p>
          <p class="instruccion">
            Ingresa el número del cliente donde deseas hacer el corte para crear dos sub-rutas.
          </p>
        </div>

        <!-- INPUT DE PUNTO DE CORTE -->
        <div class="input-section">
          <ion-item lines="none" class="input-item">
            <ion-label position="floating">Punto de corte (cliente #)</ion-label>
            <ion-input
              type="number"
              [(ngModel)]="puntoCorte"
              [min]="2"
              [max]="totalClientes - 2"
              placeholder="Ej: {{ puntoCorteDefault }}">
            </ion-input>
          </ion-item>
          
          <!-- PREVIEW DE LA DIVISIÓN -->
          <div class="preview">
            <div class="grupo grupo-a">
              <div class="grupo-icon">
                <ion-icon name="people-outline"></ion-icon>
              </div>
              <div class="grupo-info">
                <strong>Grupo A</strong>
                <p>{{ puntoCorte || puntoCorteDefault }} clientes</p>
                <span class="rango">Clientes #1 - #{{ puntoCorte || puntoCorteDefault }}</span>
              </div>
            </div>
            
            <div class="corte-visual">
              <ion-icon name="cut-outline"></ion-icon>
            </div>
            
            <div class="grupo grupo-b">
              <div class="grupo-icon">
                <ion-icon name="people-outline"></ion-icon>
              </div>
              <div class="grupo-info">
                <strong>Grupo B</strong>
                <p>{{ totalClientes - (puntoCorte || puntoCorteDefault) }} clientes</p>
                <span class="rango">Clientes #{{ (puntoCorte || puntoCorteDefault) + 1 }} - #{{ totalClientes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ADVERTENCIA -->
        @if (!esValido()) {
          <div class="advertencia">
            <ion-icon name="warning-outline"></ion-icon>
            <span>El punto de corte debe estar entre 2 y {{ totalClientes - 2 }}</span>
          </div>
        }

        <!-- BOTONES -->
        <div class="botones-section">
          <ion-button 
            expand="block" 
            color="warning" 
            (click)="calcular()"
            [disabled]="!esValido()">
            <ion-icon name="calculator-outline" slot="start"></ion-icon>
            Calcular Rutas Optimizadas
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="outline" 
            color="medium" 
            (click)="cerrar()">
            Cancelar
          </ion-button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f4f6fa;
    }
    
    .contenido-modal {
      padding: 20px;
      max-width: 500px;
      margin: 0 auto;
    }
    
    // =====================================
    // INFORMACIÓN
    // =====================================
    .info-section {
      text-align: center;
      margin-bottom: 24px;
      
      .dia-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #0099ff 0%, #20b0ff 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 12px;
        margin-bottom: 16px;
        font-size: 15px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 153, 255, 0.3);
        
        ion-icon {
          font-size: 20px;
        }
      }
      
      h3 {
        color: #1c1c1e;
        margin: 0 0 12px 0;
        font-size: 20px;
        font-weight: 700;
      }
      
      .descripcion {
        margin: 0 0 8px 0;
        color: #3c3c43;
        font-size: 15px;
        
        strong {
          color: #ff9500;
          font-weight: 700;
          font-size: 18px;
        }
      }
      
      .instruccion {
        font-size: 14px;
        color: #8e8e93;
        margin: 0;
        line-height: 1.5;
      }
    }
    
    // =====================================
    // INPUT
    // =====================================
    .input-section {
      margin-bottom: 20px;
      
      .input-item {
        --background: white;
        --border-radius: 12px;
        --padding-start: 16px;
        --padding-end: 16px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        
        ion-label {
          font-weight: 600;
          color: #8e8e93;
          font-size: 13px;
        }
        
        ion-input {
          font-weight: 600;
          font-size: 16px;
          --color: #1c1c1e;
        }
      }
    }
    
    // =====================================
    // PREVIEW DE DIVISIÓN
    // =====================================
    .preview {
      background: white;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      
      .grupo {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 12px;
        
        &.grupo-a {
          background: linear-gradient(135deg, #eaf6ff 0%, #d9edff 100%);
          border: 2px solid #0099ff;
        }
        
        &.grupo-b {
          background: linear-gradient(135deg, #fff4e6 0%, #ffe8cc 100%);
          border: 2px solid #ff9500;
        }
        
        .grupo-icon {
          min-width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          
          ion-icon {
            font-size: 28px;
          }
        }
        
        &.grupo-a .grupo-icon ion-icon {
          color: #0099ff;
        }
        
        &.grupo-b .grupo-icon ion-icon {
          color: #ff9500;
        }
        
        .grupo-info {
          flex: 1;
          
          strong {
            display: block;
            font-size: 16px;
            margin-bottom: 4px;
            color: #1c1c1e;
            font-weight: 700;
          }
          
          p {
            margin: 0 0 4px 0;
            font-size: 15px;
            color: #3c3c43;
            font-weight: 600;
          }
          
          .rango {
            font-size: 12px;
            color: #8e8e93;
            font-weight: 500;
          }
        }
      }
      
      .corte-visual {
        text-align: center;
        padding: 12px 0;
        
        ion-icon {
          font-size: 32px;
          color: #ff9500;
          animation: corte 2s ease-in-out infinite;
        }
      }
    }
    
    @keyframes corte {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }
    
    // =====================================
    // ADVERTENCIA
    // =====================================
    .advertencia {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #fff4e6;
      border: 2px solid #ff9500;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 20px;
      
      ion-icon {
        font-size: 24px;
        color: #ff9500;
        flex-shrink: 0;
      }
      
      span {
        font-size: 14px;
        color: #1c1c1e;
        font-weight: 500;
        line-height: 1.4;
      }
    }
    
    // =====================================
    // BOTONES
    // =====================================
    .botones-section {
      margin-top: 24px;
      
      ion-button {
        --border-radius: 12px;
        font-weight: 600;
        height: 50px;
        margin-bottom: 12px;
        text-transform: none;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        &[disabled] {
          opacity: 0.5;
        }
      }
    }
  `]
})
export class DividirRutaModalComponent {
  @Input() totalClientes!: number;
  @Input() puntoCorteDefault!: number;
  @Input() diaSemana!: string;

  puntoCorte: number = 0;

  constructor(private modalController: ModalController) {
    addIcons({ close, cutOutline, peopleOutline });
  }

  ngOnInit() {
    this.puntoCorte = this.puntoCorteDefault;
  }

  esValido(): boolean {
    // Debe haber al menos 2 clientes en cada grupo
    return this.puntoCorte >= 2 && this.puntoCorte <= this.totalClientes - 2;
  }

  calcular() {
    if (this.esValido()) {
      this.modalController.dismiss({
        confirmar: true,
        puntoCorte: this.puntoCorte
      });
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }
}