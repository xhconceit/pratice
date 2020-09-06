import './index.css'
if (module.hot) {
	module.hot.accept()
}
console.log('string')
if (process.env.NODE_ENV !== 'production') {
  require('./index.html')
}
