import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { GrupoService } from '../../../services/grupo.service';
import { Grupo } from '../../../shared/models/grupo.model';
import { MessageComponent } from '../../../shared/message/message.component';
import { AuthService } from '../../../services/auth.service';
import { ErrorHandlerService } from '../../../shared/error-handler.service';

@Component({
  selector: 'app-grupo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    MessageComponent,
    MessageModule
  ],
  templateUrl: './grupo-form.component.html',
  styleUrls: ['./grupo-form.component.scss']
})
export class GrupoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private grupoService = inject(GrupoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);

  form!: FormGroup;
  grupoId: number | null = null;
  errorResponse: any = null;
  errorMessage: string | null = null;

  get isEditMode(): boolean {
    return this.grupoId !== null;
  }

  ngOnInit(): void {
    this.grupoId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;

    this.form = this.fb.group({
      descricao: ['', Validators.required]
    });

    if (this.isEditMode && this.grupoId) {
      if (!this.authService.hasPermission('update_grupos')) {
        this.messageService.add({ severity: 'error', summary: 'Acesso Negado', detail: 'Você não tem permissão para editar grupos.'});
        this.router.navigate(['/painel/grupos']);
        return;
      }
      this.loadGrupo(this.grupoId);
    } else {
      if (!this.authService.hasPermission('create_grupos')) {
        this.messageService.add({ severity: 'error', summary: 'Acesso Negado', detail: 'Você não tem permissão para criar grupos.'});
        this.router.navigate(['/painel/grupos']);
        return;
      }
    }
  }

  loadGrupo(id: number): void {
    this.grupoService.getGrupoById(id).subscribe({
      next: (grupo) => {
        this.form.patchValue(grupo);
      },
      error: (err) => {
        this.errorMessage = this.errorHandlerService.formatErrorMessages(err, 'Erro ao carregar dados do grupo.');
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.errorMessage });
        this.router.navigate(['/painel/grupos']);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.keys(this.form.controls).forEach(field => {
        const control = this.form.get(field);
        control?.markAsDirty();
        control?.updateValueAndValidity({ onlySelf: true });
      });
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const grupoData = this.form.value;

    if (this.isEditMode && this.grupoId) {
      this.grupoService.updateGrupo(this.grupoId, grupoData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Grupo atualizado com sucesso!' });
          this.form.markAsPristine();
          // Não redireciona, permite mais edições ou voltar manualmente
        },
        error: (err) => {
          this.errorMessage = this.errorHandlerService.formatErrorMessages(err, 'Erro ao atualizar grupo.');
          //this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.errorMessage });
        }
      });
    } else {
      this.grupoService.createGrupo(grupoData).subscribe({
        next: (newGrupo) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Grupo criado com sucesso!' });
          // Após criar, redireciona para o modo de edição do novo grupo
          this.router.navigate(['/painel/grupos/editar', newGrupo.id]);
        },
        error: (err) => {
          this.errorMessage = this.errorHandlerService.formatErrorMessages(err, 'Erro ao criar grupo.');
          //this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.errorMessage });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/painel/grupos']);
  }
} 