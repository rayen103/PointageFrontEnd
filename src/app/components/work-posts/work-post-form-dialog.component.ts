import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { WorkPostDto, WorkPostCreateRequest } from '../../services/work-post.service';

export interface WorkPostFormDialogData {
    workPost?: WorkPostDto;
    codeSoc: string;
    isEdit: boolean;
}

@Component({
    selector: 'app-work-post-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatDividerModule
    ],
    templateUrl: './work-post-form-dialog.component.html',
    styleUrls: ['./work-post-form-dialog.component.scss']
})
export class WorkPostFormDialogComponent {
    private readonly fb = inject(FormBuilder);
    private readonly dialogRef = inject(MatDialogRef<WorkPostFormDialogComponent>);

    form: FormGroup;
    isEdit: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) public data: WorkPostFormDialogData) {
        this.isEdit = data.isEdit;

        this.form = this.fb.group({
            codeSoc: [{ value: data.codeSoc || data.workPost?.codeSoc || 'CST', disabled: true }, Validators.required],
            codePoste: [{ value: data.workPost?.codePoste || '', disabled: this.isEdit }, [Validators.required, Validators.maxLength(20)]],
            desigPoste: [data.workPost?.desigPoste || '', [Validators.required, Validators.maxLength(100)]],
            heureDeb: [data.workPost?.heureDeb || ''],
            heureFin: [data.workPost?.heureFin || ''],
            retardPermis: [data.workPost?.retardPermis || 0, [Validators.min(0), Validators.max(120)]],
            sortiePermis: [data.workPost?.sortiePermis || 0, [Validators.min(0), Validators.max(120)]],
            posteNuit: [data.workPost?.posteNuit || false],
            heuresNuit: [data.workPost?.heuresNuit || null],
            plafondDim: [data.workPost?.plafondDim || null],
            ignoreDimanche: [data.workPost?.ignoreDimanche || false],
            ignoreNuit: [data.workPost?.ignoreNuit || false],
            active: [data.workPost?.active !== false]
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.getRawValue();
            const request: WorkPostCreateRequest = {
                codeSoc: formValue.codeSoc,
                codePoste: formValue.codePoste,
                desigPoste: formValue.desigPoste,
                heureDeb: formValue.heureDeb || undefined,
                heureFin: formValue.heureFin || undefined,
                retardPermis: formValue.retardPermis,
                sortiePermis: formValue.sortiePermis,
                posteNuit: formValue.posteNuit,
                heuresNuit: formValue.heuresNuit || undefined,
                plafondDim: formValue.plafondDim || undefined,
                ignoreDimanche: formValue.ignoreDimanche,
                ignoreNuit: formValue.ignoreNuit,
                active: formValue.active
            };
            this.dialogRef.close(request);
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
