/** Fotos dos posts. Privado: o app envia por link assinado e lê por link assinado que vence. */
export interface StorageProvider {
  /** Link para o app enviar o arquivo (PUT, image/jpeg) direto ao armazenamento. */
  signUpload(path: string): Promise<string>;
  /** Links de leitura que vencem em `expiresIn` segundos. Caminho sem link (erro ou inexistente) fica de fora. */
  signRead(paths: string[], expiresIn: number): Promise<Map<string, string>>;
  remove(paths: string[]): Promise<void>;
}
