import { z } from "zod";

export const RUTA_IMAGEN = /^\/(api\/imagenes\/\d+|img\/[a-z0-9][a-z0-9._-]*)$/;

const nombre = z.string().trim().min(2, "El nombre es muy corto").max(120);
const categoria = z.string().trim().min(2, "Escribe una categoría").max(40);
const precio = z.number("El precio debe ser un número").min(0, "El precio no puede ser negativo").max(100000);
const resumen = z.string().trim().min(3, "Escribe un resumen corto").max(200, "El resumen es muy largo");
const descripcion = z.string().trim().min(3, "Escribe una descripción").max(1500, "La descripción es muy larga");
const imagen = z.string().regex(RUTA_IMAGEN, "Sube una foto del producto");

export const esquemaProductoNuevo = z.object({ nombre, categoria, precio, resumen, descripcion, imagen });

export const esquemaProductoCambios = z
  .object({
    nombre: nombre.optional(),
    categoria: categoria.optional(),
    precio: precio.optional(),
    resumen: resumen.optional(),
    descripcion: descripcion.optional(),
    imagen: imagen.optional(),
    activo: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "No hay cambios");
