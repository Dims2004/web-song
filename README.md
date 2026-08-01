# WebSong IoT — Web Player (Spotify-like) + MQTT

Website pemutar musik dengan tampilan mirip Spotify yang menjadi **controller
utama** untuk sistem IoT ESP32 + Pulse Sensor + MPU6050. Website ini:

- Mem-publish status pemutaran lagu (play/pause, judul, durasi, posisi) ke
  broker MQTT, untuk ditampilkan ESP32 di layar OLED 0.96".
- Subscribe ke topic sensor dari ESP32 (BPM detak jantung & status aktivitas
  fisik dari MPU6050) dan menampilkannya di dashboard kesehatan.

> Bagian ini adalah **tahap 1 (website)**. Firmware Arduino/ESP32 untuk OLED,
> Pulse Sensor, dan MPU6050 menyusul di tahap berikutnya dan harus mengikuti
> kontrak topic/payload MQTT yang didokumentasikan di bawah agar langsung
> kompatibel dengan website ini.

## Menjalankan secara lokal

```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # build produksi ke folder dist/
npm run preview  # jalankan hasil build
```

Node.js 20+ direkomendasikan.

## Cara pakai

1. Buka **Pengaturan MQTT** di sidebar, isi broker WebSocket (default:
   broker publik `wss://broker.hivemq.com:8884/mqtt` — cocok untuk uji coba,
   ganti dengan broker sendiri seperti HiveMQ Cloud/EMQX/Mosquitto untuk
   pemakaian nyata), lalu klik **Simpan & Sambungkan**.
2. Di halaman **Beranda**, pilih/putar lagu dari playlist demo. Status
   pemutaran otomatis dipublish ke topic downlink.
3. Lagu demo tidak menyertakan file audio (supaya paket tetap kecil & bebas
   lisensi) — posisi lagu disimulasikan otomatis saat diputar. Klik
   **Pasang audio** pada sebuah lagu untuk memakai file audio asli dari
   komputer Anda (diputar langsung di browser via `<audio>`).
4. Panel kecil di pojok kanan bawah adalah **preview layar OLED ESP32** —
   menampilkan judul (running text), animasi "piringan hitam", dan progres
   durasi persis seperti yang akan tampil di layar fisik nanti.
5. Halaman **Kesehatan** menampilkan BPM, status aktivitas, dan grafik
   riwayat BPM secara real-time dari topic uplink.

## Kontrak MQTT (dipakai juga oleh firmware ESP32 nanti)

### Downlink — Web → ESP32

- **Topic default:** `websong/player/state` (bisa diubah di Pengaturan MQTT)
- **QoS:** 0
- **Payload JSON:**

```json
{
  "status": "playing",
  "title": "Neon Nights",
  "artist": "Synthwave Collective",
  "duration": 214,
  "position": 42,
  "timestamp": 1732882345000
}
```

| Field       | Tipe                              | Keterangan                        |
| ----------- | ---------------------------------- | ---------------------------------- |
| `status`    | `"playing" \| "paused" \| "stopped"` | Status pemutaran saat ini          |
| `title`     | string                             | Judul lagu (untuk running text)    |
| `artist`    | string                             | Nama artis                         |
| `duration`  | number (detik)                     | Total durasi lagu                  |
| `position`  | number (detik)                     | Posisi putar saat ini              |
| `timestamp` | number (epoch ms)                  | Waktu pesan dikirim                |

Dikirim setiap kali status berubah (play/pause/next/prev/seek) dan setiap
1 detik selama lagu diputar, sehingga ESP32 bisa menggambar progress bar
durasi yang akurat.

### Uplink — ESP32 → Web

- **Topic default:** `websong/sensor/data` (bisa diubah di Pengaturan MQTT)
- **Payload JSON yang diharapkan website:**

```json
{
  "bpm": 82,
  "activity": "jalan",
  "timestamp": 1732882345000
}
```

| Field      | Tipe                                | Keterangan                                   |
| ---------- | ------------------------------------ | --------------------------------------------- |
| `bpm`      | number                                | Detak jantung dari Pulse Sensor               |
| `activity` | `"diam" \| "jalan" \| "lari"` (string) | Aktivitas fisik hasil deteksi MPU6050          |
| `timestamp`| number (epoch ms, opsional)           | Waktu baca sensor                             |

Website menyimpan hingga 60 sampel BPM terakhir untuk grafik riwayat, dan
menampilkan ikon berbeda untuk tiap nilai `activity` (nilai lain di luar
tiga itu akan ditampilkan apa adanya sebagai fallback).

## Struktur proyek

```
src/
  components/   # UI: Sidebar, PlaylistView, NowPlayingBar, OledPreview,
                # HealthDashboard, BpmChart, SettingsModal, dll.
  hooks/
    useMqtt.ts    # koneksi MQTT (mqtt.js via WebSocket), publish & subscribe
    usePlayer.ts  # state pemutar lagu, playlist, simulasi/real audio
  data/demoPlaylist.ts
  lib/
    mqttSettings.ts  # persist pengaturan broker ke localStorage
    format.ts        # helper format waktu
  types/index.ts     # tipe payload MQTT & domain lainnya
```

## Teknologi

React 19 + TypeScript + Vite, Tailwind CSS v4, [mqtt.js](https://github.com/mqttjs/MQTT.js)
(koneksi MQTT over WebSocket langsung dari browser), Recharts (grafik BPM),
lucide-react (ikon).
