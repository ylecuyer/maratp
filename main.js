function zeroPad(timeUnit) {
    if (timeUnit < 10) {
        return '0' + timeUnit
    }
    else {
        return timeUnit
    }
}

function setLastUpdated() {
    var now = new Date()

    hours = zeroPad(now.getHours())
    minutes = zeroPad(now.getMinutes())
    seconds = zeroPad(now.getSeconds())

    $('#last_updated').html(hours + ':' + minutes + ':' + seconds)
}

function setGoodTraffic(message) {
    $('#traffic').html(message)
}

function setBadTraffic(message) {
    // https://www.iconsdb.com/orange-icons/warning-icon.html
    $('#traffic').html('<img src="red.png" style="vertical-align: sub;"> ' + message)
}

function parseTrafficResult(data) {
    var slug = data.result.slug
    var message = data.result.message

    if (slug == 'normal') {
        setGoodTraffic(message)
    } else {
        setBadTraffic(message)
    }
}

function setErrorFetchingTraffic() {
    $('.loader', document.body).remove()
    setError('#traffic', document.body)
}

function getTrafficCondition() {
    setLoading('#traffic', document.body)
    $.get('https://api-ratp.pierre-grimaud.fr/v3/traffic/rers/b?t='+Date.now()).done(parseTrafficResult)
      .fail(setErrorFetchingTraffic)
}

function update() {
    setLastUpdated()
    getTrafficCondition()
    setTimes() 
}

$(function() {
    update()
    $('#update_now').on('click', update)
})

function setTimes() {
    $('#t tr').each(function(idx, elt) {
        if ($(elt).children().length == 0) {
            setupRow(elt)
            $('.img', elt).html("197")
            setLogo(elt, $(elt).data().code)            
        }
        fetchTimes(elt, $(elt).data())
    })
}

function setupRow(ctx) {
    $(ctx).html('<td class="img"></td><td class="t1"></td><td class="t2"></td>')
}

function setLogo(ctx, line) {
    $('.img', ctx).html('<img src="'+logoUrl(line)+'" style="max-width: 25px;"/>')
}

function logoUrl(line) {
    return "https://www.ratp.fr/sites/default/files/network/bus/ligne"+line+".svg"
}

function fetchTimes(ctx, busInfo) {
    setLoading('.img', ctx)
    $.get('https://api-ratp.pierre-grimaud.fr/v3/schedules/'+busInfo.type+'/'+busInfo.code+'/'+busInfo.station+'/'+busInfo.way+'?_format=json&t='+Date.now()).done(function(data) {
        parseTimeResult(ctx, data)
    }).fail(function() {
        setErrorFetchingTimes(ctx, data)
    })
}

function setLoading(klass, ctx) {
    $(klass, ctx).append('<img class="loader" src="loader.gif" />')
}

function setError(klass, ctx) {
    $(klass, ctx).append('<img class="error" src="red.png" />')
}

function parseTimeResult(ctx, data) {
    var t1 = _try(function() { return data.result.schedules[0].message }, "error") 
    var t2 = _try(function() { return data.result.schedules[1].message }, "error") 

    $('.loader', ctx).remove()
    $('.error', ctx).remove()
    $('.t1', ctx).html(t1)
    $('.t2', ctx).html(t2)
}

function setErrorFetchingTimes(ctx, data) {
    $('.loader', ctx).remove()
    setError('.img', ctx)
}

function _try(func, fallbackValue) {
    try {
        var value = func();
        return (value === null || value === undefined) ? fallbackValue : value;
    } catch (e) {
        return fallbackValue;
    }
}