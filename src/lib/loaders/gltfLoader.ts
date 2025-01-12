import type { Mesh } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { makeAsyncCacher } from './cacher'

const browser = !!import.meta.env
let glbUrls = browser
  ? import.meta.glob(['$target/*.glb', '$assets/*.glb'], { as: 'url', eager: true })
  : {}
const loader = new GLTFLoader()

const load = async (url: string) =>
  browser
    ? loader.loadAsync(glbUrls[url])
    : loader.parseAsync((await (await import('fs/promises')).readFile(url)).buffer, '')

const cacher = makeAsyncCacher(async (url: string) => {
  if (!browser) glbUrls = JSON.parse(process.env.GLB_URLS!)
  if (!glbUrls[url]) throw new Error(`Model for url ${url} does not exist`)
  return load(glbUrls[url]).then(g => (g.scene.children[0] as Mesh).geometry)
})

export default function loadGLTF(url: string) {
  return cacher(url, url)
}
