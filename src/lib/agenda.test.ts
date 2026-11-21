import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { AGENDA, aMinutos, diasReservables, fechaReservable, formatHora, horariosDisponibles, planificarGrupo } from "./agenda";

before(() => {
  AGENDA.capacidad = 1;
});

const ahora = { fecha: "2026-11-13", minutos: 10 * 60 };

describe("fechaReservable", () => {
  it("acepta un día laborable futuro", () => assert.equal(fechaReservable("2026-11-17", ahora), true));
  it("acepta el sábado", () => assert.equal(fechaReservable("2026-11-14", ahora), true));
  it("rechaza el domingo", () => assert.equal(fechaReservable("2026-11-15", ahora), false));
  it("rechaza fechas pasadas", () => assert.equal(fechaReservable("2026-11-12", ahora), false));
  it("rechaza fechas demasiado lejanas", () => assert.equal(fechaReservable("2027-02-01", ahora), false));
  it("rechaza fechas inexistentes y formatos raros", () => {
    assert.equal(fechaReservable("2026-02-31", ahora), false);
    assert.equal(fechaReservable("17/11/2026", ahora), false);
  });
});

describe("horariosDisponibles", () => {
  const base = { fecha: "2026-11-17", ahora };

  it("día vacío: de 9:00 a 17:00 cada 30 min para un baño de 1 h", () => {
    const h = horariosDisponibles({ ...base, duracionMin: 60, ocupadas: [] });
    assert.equal(h[0], "09:00");
    assert.equal(h.at(-1), "17:00");
    assert.equal(h.length, 17);
  });

  it("un servicio largo no puede terminar después del cierre", () => {
    const h = horariosDisponibles({ ...base, duracionMin: 120, ocupadas: [] });
    assert.equal(h.at(-1), "16:00");
  });

  it("no ofrece horarios que se cruzan con una cita existente", () => {
    const h = horariosDisponibles({ ...base, duracionMin: 60, ocupadas: [{ inicioMin: aMinutos("10:00"), finMin: aMinutos("11:00") }] });
    assert.ok(h.includes("09:00"));
    assert.ok(!h.includes("09:30"));
    assert.ok(!h.includes("10:00"));
    assert.ok(!h.includes("10:30"));
    assert.ok(h.includes("11:00"));
  });

  it("un servicio largo también respeta la cita que viene después", () => {
    const h = horariosDisponibles({ ...base, duracionMin: 120, ocupadas: [{ inicioMin: aMinutos("12:00"), finMin: aMinutos("13:00") }] });
    assert.ok(h.includes("10:00"));
    assert.ok(!h.includes("10:30"));
  });

  it("el mismo día exige anticipación (ahora son las 10:00, margen de 1 h)", () => {
    const h = horariosDisponibles({ fecha: "2026-11-13", duracionMin: 60, ocupadas: [], ahora });
    assert.equal(h[0], "11:00");
  });

  it("un domingo no devuelve horarios", () => {
    assert.deepEqual(horariosDisponibles({ fecha: "2026-11-15", duracionMin: 60, ocupadas: [], ahora }), []);
  });
});

describe("diasReservables", () => {
  it("no incluye domingos y empieza hoy", () => {
    const dias = diasReservables(ahora);
    assert.equal(dias[0], "2026-11-13");
    assert.ok(!dias.includes("2026-11-15"));
    assert.ok(dias.includes("2026-11-16"));
  });
});

describe("formatHora", () => {
  it("convierte a formato de 12 horas", () => {
    assert.equal(formatHora("09:00"), "9:00 a. m.");
    assert.equal(formatHora("12:30"), "12:30 p. m.");
    assert.equal(formatHora("17:00"), "5:00 p. m.");
  });
});

describe("planificarGrupo (varias mascotas)", () => {
  it("con 1 peluquero se atienden una tras otra", () => {
    assert.deepEqual(planificarGrupo(["basico", "basico", "basico"]), { duracionMin: 180, puestos: 1 });
    assert.deepEqual(planificarGrupo(["premium", "basico"]), { duracionMin: 150, puestos: 1 });
  });

  it("rechaza servicios desconocidos o listas vacías", () => {
    assert.equal(planificarGrupo(["lujo"]), null);
    assert.equal(planificarGrupo([]), null);
  });

  it("un grupo de 3 baños básicos termina a las 18:00 si empieza a las 15:00", () => {
    const h = horariosDisponibles({ fecha: "2026-11-17", duracionMin: 180, ocupadas: [], ahora });
    assert.equal(h.at(-1), "15:00");
  });

  it("si el grupo no cabe en el día, no hay horarios", () => {
    const plan = planificarGrupo(["bano-corte", "bano-corte", "bano-corte", "bano-corte", "bano-corte"])!;
    assert.deepEqual(horariosDisponibles({ fecha: "2026-11-17", ...plan, ocupadas: [], ahora }), []);
  });
});

describe("varios peluqueros", () => {
  it("con 2 peluqueros las mascotas se reparten en paralelo", () => {
    AGENDA.capacidad = 2;
    try {
      assert.deepEqual(planificarGrupo(["premium", "basico", "basico"]), { duracionMin: 120, puestos: 2 });
    } finally {
      AGENDA.capacidad = 1;
    }
  });

  it("con 3 peluqueros, 3 mascotas se atienden a la vez y la cuarta espera", () => {
    AGENDA.capacidad = 3;
    try {
      assert.deepEqual(planificarGrupo(["premium", "basico", "basico"]), { duracionMin: 90, puestos: 3 });
      assert.deepEqual(planificarGrupo(["premium", "basico", "basico", "basico"]), { duracionMin: 120, puestos: 3 });
    } finally {
      AGENDA.capacidad = 1;
    }
  });

  it("una cita de 1 peluquero deja lugar a otra, pero no a una que necesita 2", () => {
    AGENDA.capacidad = 2;
    try {
      const ocupadas = [{ inicioMin: aMinutos("10:00"), finMin: aMinutos("11:00"), puestos: 1 }];
      const base = { fecha: "2026-11-17", duracionMin: 60, ocupadas, ahora };
      assert.ok(horariosDisponibles({ ...base, puestos: 1 }).includes("10:00"));
      assert.ok(!horariosDisponibles({ ...base, puestos: 2 }).includes("10:00"));
    } finally {
      AGENDA.capacidad = 1;
    }
  });
});
