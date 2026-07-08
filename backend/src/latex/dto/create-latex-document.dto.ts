import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLatexDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  template?: 'journal' | 'conference';
}
