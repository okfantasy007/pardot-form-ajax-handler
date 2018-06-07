/****************************************************
*  project: pardot form ajax handler                *
*  description: main script                         *
*  author: horans@gmail.com                         *
*  url: github.com/horans/pardot-form-ajax-handler  *
*  update: 170607                                   *
****************************************************/

/* global $ */

// namespace
var pfah = {}

// get script path
// stackoverflow.com/questions/2255689/
var pScripts = document.getElementsByTagName('script')
pfah.src = pScripts[pScripts.length - 1].src
pfah.path = pfah.src.substring(0, pfah.src.lastIndexOf('/') + 1)

// load popup vendor
pfah.load = {
  vendor: false,
  style: false
}
pfah.init = {
  vendor: function () {
    if (!pfah.load.vendor) {
      pfah.popup = document.createElement('script')
      pfah.popup.src = pfah.path + 'jquery.bpopup.min.js'
      document.getElementsByTagName('head')[0].appendChild(pfah.popup)
      pfah.load.vendor = true
    }
  },
  style: function () {
    pfah.style = document.createElement('link')
    pfah.style.rel = 'stylesheet'
    pfah.style.href = pfah.path + 'pardot-form.css'
    document.getElementsByTagName('head')[0].appendChild(pfah.style)
    var s = $('.pfah-wrapper').data('style').toLowerCase()
    if (s) {
      pfah.brand = document.createElement('link')
      pfah.brand.rel = 'stylesheet'
      pfah.brand.href = pfah.path + 'pardot-form-' + s + '.css'
      document.getElementsByTagName('head')[0].appendChild(pfah.brand)
    }
    pfah.load.style = true
  },
  form: function () {
    $('.pfah-wrapper').each(function () {
      var p = $(this).find('.pfah-form').attr('action')
      if (p.indexOf('go.pardot.com') < 0) {
        $(this).trigger('pfah.form.error')
          .find('[type="submit"]').attr('disabled', 'disabled')
        window.console.log('[pfah] not a pardot form')
      } else {
        var i = p.substring(p.lastIndexOf('/') + 1)
        $(this).attr('id', 'pfah-' + i)
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
  $('#' + pfah.form.id).trigger('pfah.callback', [res.result, pfah.form.id])
  window.console.log('[pfah] callback ' + res.result)
}

// document ready
$(function () {
  // initialize
  if ($('.pfah-wrapper').length > 0) pfah.init.form()
  if ($('.pfah-wrapper').length > 0) pfah.init.style()
  if ($('.pfah-popup').length > 0) pfah.init.vendor()

  // submit form
  $('body').on('submit', '.pfah-form', function (e) {
    e.preventDefault()
    if (!pfah.form.load) {
      pfah.form.load = true
      var t = $(this)
      pfah.form.id = t.closest('.pfah-wrapper').attr('id')
      t.find('[type="submit"]').attr('disabled', 'disabled')
      $.ajax({
        url: t.attr('action'),
        method: 'POST',
        data: t.serialize(),
        dataType: 'jsonp'
      })
    }
  })

  // callback handler
  $('body').on('pfah.callback', function (e, result, id) {
    if (result === 'done' && $('#' + id).data('state') !== 'no') window.localStorage.setItem(pfah.form.id, result)
    $('#' + pfah.form.id).addClass('pfah-result-' + result)
      .find('[type="submit"]').removeAttr('disabled')
    pfah.form.id = ''
    pfah.form.load = false
  })

  // close error message
  $('body').on('click', '.pfah-error', function () {
    $(this).closest('.pfah-wrapper').removeClass('pfah-result-error')
  })
})