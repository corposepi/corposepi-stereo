import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const logoPath = join(__dirname, 'public', 'logo.png')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  const outPath = join(__dirname, 'public', 'icons', `icon-${size}.png`)

  // Tamaño del logo dentro del icono (85% del área para dejar margen)
  const logoSize = Math.round(size * 0.85)

  // Fondo blanco cuadrado del tamaño del icono
  const background = {
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }

  // Redimensionar el logo con el margen
  const resizedLogo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer()

  // Centrar el logo sobre el fondo blanco
  const offsetX = Math.round((size - logoSize) / 2)
  const offsetY = Math.round((size - logoSize) / 2)

  await sharp(background)
    .composite([{ input: resizedLogo, top: offsetY, left: offsetX }])
    .png()
    .toFile(outPath)

  console.log(`✅ icon-${size}.png generado`)
}

console.log('\n🎉 Todos los iconos generados desde el logo oficial CORPOSEPI')
