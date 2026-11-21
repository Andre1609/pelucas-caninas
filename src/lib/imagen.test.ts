import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sharp from "sharp";
import { ImagenInvalida, MAX_BYTES, procesarImagen } from "./imagen";

const crear = (ancho: number, alto: number, formato: "png" | "jpeg" | "webp" = "png") =>
  sharp({ create: { width: ancho, height: alto, channels: 3, background: "#c08a50" } })[formato]().toBuffer();

describe("procesarImagen", () => {
  it("reduce una foto grande a 1200 px como máximo y la convierte a WebP", async () => {
    const salida = await procesarImagen(await crear(3000, 2000));
    const meta = await sharp(salida).metadata();
    assert.equal(meta.format, "webp");
    assert.equal(meta.width, 1200);
    assert.equal(meta.height, 800);
  });

  it("no agranda las imágenes pequeñas", async () => {
    const meta = await sharp(await procesarImagen(await crear(300, 200, "jpeg"))).metadata();
    assert.equal(meta.width, 300);
  });

  it("acepta WebP", async () => {
    assert.ok((await procesarImagen(await crear(400, 400, "webp"))).length > 0);
  });

  it("rechaza archivos que no son imágenes", async () => {
    await assert.rejects(() => procesarImagen(Buffer.from("esto no es una imagen")), ImagenInvalida);
    await assert.rejects(() => procesarImagen(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>")), ImagenInvalida);
  });

  it("rechaza formatos no permitidos", async () => {
    const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: "#fff" } }).gif().toBuffer();
    await assert.rejects(() => procesarImagen(gif), /JPG, PNG o WebP/);
  });

  it("rechaza archivos vacíos o demasiado pesados", async () => {
    await assert.rejects(() => procesarImagen(Buffer.alloc(0)), ImagenInvalida);
    await assert.rejects(() => procesarImagen(Buffer.alloc(MAX_BYTES + 1)), /menos de 4 MB/);
  });
});
