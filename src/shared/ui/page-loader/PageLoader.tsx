import { Spinner } from '../spinner/Spinner'
import './page-loader.scss'

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner />
    </div>
  )
}
