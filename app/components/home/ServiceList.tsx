import type { Service } from '../../content/services'

export function ServiceList({ services }: { services: Service[] }) {
  return (
    <ul className="svc">
      {services.map((s) => (
        <li key={s.name}>
          <b>{s.name}</b>
          <span>{s.blurb}</span>
        </li>
      ))}
    </ul>
  )
}
