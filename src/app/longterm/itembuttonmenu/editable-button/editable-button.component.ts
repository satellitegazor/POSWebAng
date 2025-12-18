import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-editable-button',
  imports: [CommonModule, FormsModule],
  templateUrl: './editable-button.component.html',
  styleUrl: './editable-button.component.css'
})
export class EditableButtonComponent implements AfterViewInit {

  // Only ONE @Input() — use setter to react to changes
  @Input() set name(val: string) {
    this._name = val || 'New Department';
    this.currentName = this._name;
    this.editName = this._name;
  }

  @Output() nameChange = new EventEmitter<string>();

  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  private _isActive: boolean = false;
  @Output() activate = new EventEmitter<void>();
  @Input()
  set isActive(value: boolean) {
    this._isActive = value === true;  // coerce to boolean
    // Optional: trigger change detection if needed
    // this.changeDetectorRef.markForCheck();
  }
  get isActive(): boolean {
    return this._isActive;
  }
  // Private backing field
  private _name: string = 'New Department';

  // Public values used in template
  currentName: string = this._name;
  editName: string = this._name;

  isEditing = false;
  isHovered = false;

  ngAfterViewInit() {
    // Initial sync (in case @Input was set before view init)
    this.currentName = this._name;
    this.editName = this._name;
  }

  startEditing(event: Event) {
    event.stopPropagation();
    this.isEditing = true;
    setTimeout(() => {
      this.inputElement?.nativeElement.focus();
      this.inputElement?.nativeElement.select(); // optional: select all text
    }, 0);
  }

  onButtonClick(event: PointerEvent) {
    if ((event.target as HTMLElement).closest('.pencil-icon')) {
      return;
    }

    // Activate the button (emit event so parent can set isActive = true)
    this.activate.emit();
  }

  save() {
    const trimmed = this.editName.trim();
    if (trimmed && trimmed !== this.currentName) {
      this.currentName = trimmed;
      this._name = trimmed;
      this.nameChange.emit(trimmed);
    }
    this.isEditing = false;
  }

  cancel() {
    this.editName = this.currentName;
    this.isEditing = false;
  }

  // Optional: hover events (uncomment if you want pencil only on hover)
  // @HostListener('mouseenter') onMouseEnter() { this.isHovered = true; }
  // @HostListener('mouseleave') onMouseLeave() { this.isHovered = this.isEditing; }
}