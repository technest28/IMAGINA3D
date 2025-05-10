import { Role } from "./role";

export interface User {
    _id: string;
    name: string;
    lastnameFather: string;
    lastnameMother: string;
    email: string;
    password?: string;
    role: Role;
    isHidden?: boolean; // Opcional, para control de visibilidad
  }
