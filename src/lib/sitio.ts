export const SITE = {
  nombre: "Pelucas Caninas",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "",
  redes: {
    tiktok: "https://www.tiktok.com/@pelucascaninasok?lang=es-419",
    facebook: "https://www.facebook.com/profile.php?id=100064917535819",
    instagram: "https://www.instagram.com/pelucascaninas/",
  },
};

export function wa(texto: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export const soles = (n: number) => `S/ ${n.toFixed(2)}`;

export function waCliente(telefono: string, texto: string) {
  const digitos = telefono.replace(/\D/g, "");
  const numero = digitos.length === 9 ? `51${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
