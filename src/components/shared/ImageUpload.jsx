import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { uploadImage } from '../../lib/storage'
import toast from 'react-hot-toast'

/**
 * Componente de upload de imagem.
 * - Aceita toque em mobile (usa input type=file)
 * - Mostra preview imediato
 * - Chama onUploaded(url) após o upload
 */
export default function ImageUpload({ currentUrl = '', onUploaded, folder = 'products', label = 'Imagem' }) {
  const inputRef  = useRef(null)
  const [preview, setPreview]   = useState(currentUrl)
  const [loading, setLoading]   = useState(false)

  async function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local imediato
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setLoading(true)

    try {
      const url = await uploadImage(file, folder)
      setPreview(url)
      onUploaded(url)
      toast.success('Imagem enviada!')
    } catch (err) {
      toast.error(err.message)
      setPreview(currentUrl) // reverte
    } finally {
      setLoading(false)
      // Limpa input para permitir reselecionar o mesmo arquivo
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function clearImage() {
    setPreview('')
    onUploaded('')
  }

  return (
    <div>
      <p className="dm-label">{label}</p>

      {/* Preview */}
      {preview && (
        <div className="relative mb-3 inline-block">
          <img
            src={preview}
            alt="preview"
            className="h-32 w-24 object-cover border border-dm-border"
          />
          {!loading && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white flex items-center justify-center rounded-full"
            >
              <X size={10} />
            </button>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-dm-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="dm-btn-ghost text-[10px] gap-1.5"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-dm-gold border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          {loading ? 'Enviando...' : preview ? 'Trocar Imagem' : 'Enviar Imagem'}
        </button>
      </div>

      {/* Input file - hidden, aceita câmera e galeria no mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleChange}
        className="hidden"
        aria-label="Selecionar imagem"
      />

      <p className="text-[10px] text-dm-muted mt-1.5">JPG, PNG ou WebP · máx. 5 MB</p>
    </div>
  )
}
