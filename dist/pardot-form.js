/****************************************************
*  project: pardot form ajax handler                *
*  description: main script                         *
*  author: horans@gmail.com                         *
*  url: github.com/horans/pardot-form-ajax-handler  *
*  update: 170608                                   *
****************************************************/

/* global $ */

// namespace
var pfah = {}

// get script path
// stackoverflow.com/questions/2255689/
var pScripts = document.getElementsByTagName('script')
pfah.src = pScripts[pScripts.length - 1].src
pfah.path = pfah.src.substring(0, pfah.src.lastIndexOf('/') + 1)

// load asset
pfah.asset = function (type, asset) {
  if (type !== 'vendor') type = 'style'
  if ($('head #' + type + '-' + asset).length === 0) {
    var a = document.createElement(type === 'vendor' ? 'script' : 'link')
    a.id = type + '-' + asset
    if (type === 'vendor') {
      a.src = pfah.path + 'vendor/' + asset + '.min.js'
    } else {
      a.rel = 'stylesheet'
      a.href = pfah.path + 'pardot-form' + (asset === 'pfah' ? '' : ('-' + asset)) + '.css'
    }
    document.getElementsByTagName('head')[0].appendChild(a)
  }
}

// initialize
pfah.init = {
  vendor: function () {
    // popup
    pfah.asset('vendor', 'jquery.bpopup')
  },
  style: function () {
    if ($('.pfah-wrapper').data('style').toLowerCase() !== 'no') {
      // default style
      pfah.asset('style', 'pfah')
      // customize theme
      $('.pfah-wrapper').each(function () {
        var t = $(this).data('theme').toLowerCase()
        if (t) pfah.asset('style', t)
      })
    }
  },
  form: function () {
    $('.pfah-wrapper').each(function () {
      var p = $(this).find('.pfah-form').attr('action')
      // check form link
      if (p.indexOf('go.pardot.com') < 0) {
        $(this).trigger('pfah.notpardot')
          .find('[type="submit"]').attr('disabled', 'disabled')
        window.console.log('[pfah] not a pardot form')
      } else {
        // add source track
        var s = $(this).data('source')
        if (s && $(this).find('[name="' + s + '"]').length === 0) {
          $(this).prepend('<input type="hidden" name="' + s + '" value="' + window.location.href + '" />')
        }
        // add id
        var i = p.substring(p.lastIndexOf('/') + 1)
        $(this).attr('id', 'pfah-' + i)
        // load state
        var l = window.localStorage.getItem('pfah-' + i)
        if (l) $(this).addClass('pfah-result-' + l)
      }
    })
  }
}

// form state
pfah.form = {
  id: '',
  load: false
}

// callback
pfah.callback = function (res) {
  $('#' + pfah.form.id).trigger('pfah.callback', [pfah.form.id, res.result])
  window.console.log('[pfah] callback ' + res.result)
}

// document ready
$(function () {
  // initialize
  if ($('.pfah-wrapper').length > 0) {
    pfah.init.form()
    pfah.init.style()
  }
  if ($('.pfah-popup').length > 0) pfah.init.vendor()

  // submit form
  $('body').on('submit', '.pfah-wrapper', function (e) {
    e.preventDefault()
    if (!pfah.form.load) {
      pfah.form.load = true
      var f = $(this).find('.pfah-form')
      pfah.form.id = $(this).attr('id')
      f.find('[type="submit"]').attr('disabled', 'disabled')
      window.console.log('[pfah] form submit')
      $(this).trigger('pfah.submit', pfah.form.id)
      // stackoverflow.com/questions/47047487/
      $.ajax({
        url: f.attr('action'),
        method: 'POST',
        data: f.serialize(),
        dataType: 'jsonp'
      })
    }
  })

  // callback handler
  $('body').on('pfah.callback', function (e, id, result) {
    var s = $('#' + id).data('state').toLowerCase()
    if (s && (result === s || s === 'all')) window.localStorage.setItem(pfah.form.id, result)
    $('#' + pfah.form.id).addClass('pfah-result-' + result)
      .find('[type="submit"]').removeAttr('disabled')
    pfah.form.id = ''
    pfah.form.load = false
  })

  // close error message
  $('body').on('click', '.pfah-error', function () {
    var f = $(this).closest('.pfah-wrapper')
    f.removeClass('pfah-result-error')
    window.localStorage.removeItem(f.attr('id'))
  })
})
