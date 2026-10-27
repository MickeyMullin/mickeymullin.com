import type { Service } from '../../content/services'

export function ServiceList({ services }: { services: Service[] }) {
  return (
    <ul className="svc">
      {services.map((s) => (
        <li key={s.name}>
          <b>{s.href ? <a href={s.href}>{s.name}</a> : s.name}</b>
          <span>{s.blurb}</span>
        </li>
      ))}
    </ul>
  )
}
