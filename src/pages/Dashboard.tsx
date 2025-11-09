import React, { useEffect, useState } from 'react'
import { fetchSeries, createSeries, updateSeriesPut, updateSeriesPatch, deleteSeries } from '../services/series'
import { ISeries, SeriesStatus } from '../types'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

function SeriesForm({ onSave, initial }:{ onSave:(s:ISeries)=>Promise<void>, initial?: Partial<ISeries> }){
  const [titulo,setTitulo] = useState(initial?.titulo||'')
  const [nota,setNota] = useState(initial?.nota?.toString()||'0')
  const [numeroTemporadas,setNumeroTemporadas] = useState(initial?.numeroTemporadas?.toString()||'1')
  const [episodiosTotais,setEpisodiosTotais] = useState(initial?.episodiosTotais?.toString()||'1')
  const [episodiosAssistidos,setEpisodiosAssistidos] = useState(initial?.episodiosAssistidos?.toString()||'0')
  const [status,setStatus] = useState(initial?.status||SeriesStatus.PLANEJADO)
  const [error,setError] = useState<string | null>(null)

  async function submit(e:React.FormEvent){
    e.preventDefault()
    if (!titulo.trim()){ setError('Título é obrigatório'); return }
    const n = Number(nota)
    if (isNaN(n) || n < 0 || n > 10){ setError('Nota deve ser entre 0 e 10'); return }
    const payload: ISeries = {
      titulo,
      nota: n,
      numeroTemporadas: Number(numeroTemporadas) || 1,
      episodiosTotais: Number(episodiosTotais) || 1,
      episodiosAssistidos: Number(episodiosAssistidos) || 0,
      status: status as SeriesStatus
    }
    setError(null)
    await onSave(payload)
  }

  return (
    <form onSubmit={submit} className="card">
      <input placeholder="Título" value={titulo} onChange={e=>setTitulo(e.target.value)} required />
      <input placeholder="Nota (0-10)" value={nota} onChange={e=>setNota(e.target.value)} type="number" min={0} max={10} />
      <input placeholder="Número de temporadas" value={numeroTemporadas} onChange={e=>setNumeroTemporadas(e.target.value)} type="number" min={1} />
      <input placeholder="Episódios totais" value={episodiosTotais} onChange={e=>setEpisodiosTotais(e.target.value)} type="number" min={1} />
      <input placeholder="Episódios assistidos" value={episodiosAssistidos} onChange={e=>setEpisodiosAssistidos(e.target.value)} type="number" min={0} />
      <select value={status} onChange={e=>setStatus(e.target.value as SeriesStatus)}>
        <option value={SeriesStatus.PLANEJADO}>Planejado</option>
        <option value={SeriesStatus.ASSISTINDO}>Assistindo</option>
        <option value={SeriesStatus.CONCLUIDO}>Concluído</option>
      </select>
      {error && <div style={{color:'salmon'}}>{error}</div>}
      <button type="submit" className="btn btn-lg">Salvar</button>
    </form>
  )
}

export default function Dashboard(){
  const [series,setSeries] = useState<ISeries[]>([])
  const [loading,setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingInitial, setEditingInitial] = useState<Partial<ISeries> | undefined>(undefined)
  // filter states
  const [qTitle, setQTitle] = useState<string>('')
  const [qStatus, setQStatus] = useState<string>('')
  const [qMinNota, setQMinNota] = useState<string>('')
  const [qMaxNota, setQMaxNota] = useState<string>('')
  const { logout } = useAuth()

  async function load(filters?: Record<string,string|number|undefined>){
    setLoading(true)
    try{
      const data = await fetchSeries(filters)
      let list = data || []
      // apply client-side filtering fallback if filters provided (backend may ignore query params)
      if (filters && Object.keys(filters).length){
        const f = filters as Record<string, any>
        list = list.filter((s: ISeries) => {
          if (f.titulo && !String(s.titulo).toLowerCase().includes(String(f.titulo).toLowerCase())) return false
          if (f.status && String(s.status) !== String(f.status)) return false
          if (f.minNota !== undefined && f.minNota !== null && f.minNota !== ''){
            const min = Number(f.minNota)
            if (isNaN(min) || Number(s.nota) < min) return false
          }
          if (f.maxNota !== undefined && f.maxNota !== null && f.maxNota !== ''){
            const max = Number(f.maxNota)
            if (isNaN(max) || Number(s.nota) > max) return false
          }
          return true
        })
      }
      setSeries(list)
    }catch(err:any){
      toast.error(err?.message || 'Erro ao buscar séries')
    }finally{setLoading(false)}
  }

  useEffect(()=>{load()},[])

  function applyFilters(){
    const filters: Record<string,string|number|undefined> = {}
    if (qTitle) filters.titulo = qTitle
    if (qStatus) filters.status = qStatus
    if (qMinNota) filters.minNota = Number(qMinNota)
    if (qMaxNota) filters.maxNota = Number(qMaxNota)
    load(filters)
  }

  function clearFilters(){
    setQTitle('')
    setQStatus('')
    setQMinNota('')
    setQMaxNota('')
    load()
  }

  async function handleCreate(payload: ISeries){
    try{
      await createSeries(payload)
      toast.success('Série criada')
      await load()
    }catch(err:any){ toast.error(err?.message || 'Erro ao criar') }
  }

  async function handleDelete(id?:string){
    if(!id) return
    try{
      await deleteSeries(id)
      toast.success('Deletado')
      await load()
    }catch(err:any){ toast.error(err?.message || 'Erro ao deletar') }
  }

  async function handleUpdate(id:string, payload:Partial<ISeries>){
    try{
      // default to PATCH for partial updates
      await updateSeriesPatch(id, payload)
      toast.success('Atualizado')
      await load()
    }catch(err:any){ toast.error(err?.message || 'Erro ao atualizar') }
  }

  async function handleEditSave(payload: ISeries){
    if (!editingId) return
    try{
      // decidir entre PUT (substituição completa) e PATCH (parcial)
      const original = editingInitial || {}
      const keys: (keyof ISeries)[] = ['titulo','nota','numeroTemporadas','episodiosTotais','episodiosAssistidos','status']
      // verificar se o usuário alterou todos os campos (substituição completa)
      const allChanged = keys.every(k => (original as any)[k] !== undefined && (original as any)[k] !== (payload as any)[k])
      if (allChanged) {
        await updateSeriesPut(editingId, payload)
      } else {
        // construir payload parcial com apenas os campos alterados
        const partial: Partial<ISeries> = {}
        keys.forEach(k => {
          if ((original as any)[k] !== (payload as any)[k]) (partial as any)[k] = (payload as any)[k]
        })
        // se nenhum campo mudou (por segurança), envia o payload completo via PUT
        if (Object.keys(partial).length === 0) {
          await updateSeriesPut(editingId, payload)
        } else {
          await updateSeriesPatch(editingId, partial)
        }
      }
      toast.success('Série atualizada')
      setEditingId(null)
      setEditingInitial(undefined)
      await load()
    }catch(err:any){ toast.error(err?.message || 'Erro ao atualizar') }
  }

  return (
    <div>
      <div className="nav">
        <h3>MySeriesList</h3>
        <div>
          <button className="btn btn-lg" onClick={logout}>Logout</button>
        </div>
      </div>
      <div style={{marginTop:12}}>
        {editingId ? (
          <div>
            <h4>Editar série</h4>
            <SeriesForm onSave={handleEditSave} initial={editingInitial} />
            <div style={{marginTop:8}}>
              <button className="btn" onClick={() => { setEditingId(null); setEditingInitial(undefined) }}>Cancelar edição</button>
            </div>
          </div>
        ) : (
          <SeriesForm onSave={handleCreate} />
        )}
      </div>

      <div className="filter-box" style={{marginTop:12}}>
        <strong>Filtrar séries</strong>
        <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
          <input placeholder="Título (contém)" value={qTitle} onChange={e=>setQTitle(e.target.value)} />
          <select value={qStatus} onChange={e=>setQStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value={SeriesStatus.PLANEJADO}>Planejado</option>
            <option value={SeriesStatus.ASSISTINDO}>Assistindo</option>
            <option value={SeriesStatus.CONCLUIDO}>Concluído</option>
          </select>
          <input placeholder="Nota mínima" value={qMinNota} onChange={e=>setQMinNota(e.target.value)} type="number" min={0} max={10} style={{width:120}} />
          <input placeholder="Nota máxima" value={qMaxNota} onChange={e=>setQMaxNota(e.target.value)} type="number" min={0} max={10} style={{width:120}} />
          <div>
            <button className="btn btn-lg" onClick={applyFilters} style={{marginRight:6}}>Aplicar filtros</button>
            <button className="btn btn-lg" onClick={clearFilters}>Limpar</button>
          </div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {loading ? <div>Carregando...</div> : (
          <div className="series-grid">
            {series.map(s=> (
              <div className="series-item" key={s._id}>
                <h4>{s.titulo}</h4>
                <div>Nota: {s.nota}</div>
                <div>Temporadas: {s.numeroTemporadas}</div>
                <div>Episódios: {s.episodiosAssistidos}/{s.episodiosTotais}</div>
                <div>Status: {s.status}</div>
                <div style={{display:'flex',gap:6,marginTop:8}}>
                  <button className="btn btn-lg" onClick={()=>handleDelete(s._id)}>Deletar</button>
                  <button className="btn btn-lg" onClick={() => { setEditingId(s._id||null); setEditingInitial(s) }}>Editar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
