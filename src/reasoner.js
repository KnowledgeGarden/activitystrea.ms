/**
 * Copyright 2013 International Business Machines Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Utility library for working with Activity Streams Actions
 * Requires underscorejs.
 *
 * @author James M Snell (jasnell@us.ibm.com)
 */
var vocabs = require('./vocabs');
var utils  = require('./utils');
var util   = require('util');
var N3     = require('n3');

function subClassHierarchy(store, subject) {
  var types = [subject];
  var res = store.findByIRI(subject, vocabs.rdfs.subClassOf, null);
  for (var n = 0, l = res.length; n < l; n++)
    types.push(subClassHierarchy(store, res[n].object));
  return types;
}

function subPropertyHierarchy(store, subject) {
  var types = [subject];
  var res = store.findByIRI(subject, vocabs.rdfs.subPropertyOf, null);
  for (var n = 0, l = res.length; n < l; n++)
    types.push(subPropertyHierarchy(store, res[n].object));
  return types;
}

function descendantPropertiesOf(store, subject) {
  var types = [subject];
  var res = store.findByIRI(null, vocabs.rdfs.subPropertyOf, subject);
  for (var n = 0, l = res.length; n < l; n++)
    types.push(descendantPropertiesOf(store, res[n].subject));
  return types;
}

function descendantClassesOf(store, subject) {
  var types = [subject];
  var res = store.findByIRI(null, vocabs.rdfs.subClassOf, subject);
  for (var n = 0, l = res.length; n < l; n++)
    types.push(descendantClassesOf(store, res[n].subject));
  return types;
}

function searchTypes(types, object) {
  for (var n = 0, l = types.length; n < l; n++) {
    if (Array.isArray(types[n])) {
      if (searchTypes(types[n],object))
        return true;
    } else {
      if (object == types[n])
        return true;
    }
  }
  return false;
}

function isSubClassOf(store, subject, object) {
  if (subject == object) return true;
  var types = subClassHierarchy(store, subject);
  return searchTypes(types, object);
}

function isSubPropertyOf(store, subject, object) {
  if (subject == object) return true;
  var types = subPropertyHierarchy(store, subject);
  return searchTypes(types, object);
}

function count_type(subject, type) {
  return this._store.countByIRI(subject, vocabs.rdf.type, type) > 0;
}

function _init(reasoner) {

  [
    [vocabs.as.items, vocabs.asx.PossiblyOrdered],
    [vocabs.xsd.float, vocabs.asx.Number],
    [vocabs.xsd.decimal, vocabs.asx.Number],
    [vocabs.xsd.double, vocabs.asx.Number],
    [vocabs.xsd.integer, vocabs.asx.Number],
    [vocabs.xsd.nonPositiveInteger, vocabs.asx.Number],
    [vocabs.xsd.long, vocabs.asx.Number],
    [vocabs.xsd.nonNegativeInteger, vocabs.asx.Number],
    [vocabs.xsd.negativeInteger, vocabs.asx.Number],
    [vocabs.xsd.int, vocabs.asx.Number],
    [vocabs.xsd.unsignedLong, vocabs.asx.Number],
    [vocabs.xsd.positiveInteger, vocabs.asx.Number],
    [vocabs.xsd.short, vocabs.asx.Number],
    [vocabs.xsd.unsignedInt, vocabs.asx.Number],
    [vocabs.xsd.byte, vocabs.asx.Number],
    [vocabs.xsd.unsignedShort, vocabs.asx.Number],
    [vocabs.xsd.unsignedByte, vocabs.asx.Number],
    [vocabs.xsd.dateTime, vocabs.asx.Date],
    [vocabs.xsd.date, vocabs.asx.Date],
    [vocabs.xsd.boolean, vocabs.asx.Boolean],
    [vocabs.as.Accept, vocabs.as.Respond],
    [vocabs.as.Activity, vocabs.as.Object],
    [vocabs.as.Block, vocabs.as.Ignore],
    [vocabs.as.IntransitiveActivity, vocabs.as.Activity],
    [vocabs.as.Actor, vocabs.as.Object], 
    [vocabs.as.Achieve, vocabs.as.Object],
    [vocabs.as.Add, vocabs.as.Activity],
    [vocabs.as.Album, vocabs.as.Collection],
    [vocabs.as.Announce, vocabs.as.Activity],
    [vocabs.as.Application, vocabs.as.Actor], 
    [vocabs.as.Arrive, vocabs.as.IntransitiveActivity],
    [vocabs.as.Article, vocabs.as.Content],
    [vocabs.as.Assign, vocabs.as.Activity],
    [vocabs.as.Audio, vocabs.as.Document],
    [vocabs.as.BrowserView, [vocabs.as.ActivityHandler , vocabs.as.Link]],
    [vocabs.as.Collection, vocabs.as.Object], 
    [vocabs.as.Complete, vocabs.as.Activity],
    [vocabs.as.Confirm, vocabs.as.Respond],
    [vocabs.as.Connect, vocabs.as.Activity],
    [vocabs.as.Content, vocabs.as.Object],
    [vocabs.as.Create, vocabs.as.Activity], 
    [vocabs.as.Delete, vocabs.as.Activity],
    [vocabs.as.Device, vocabs.as.Actor],
    [vocabs.as.Dislike, vocabs.as.Respond],
    [vocabs.as.Document, vocabs.as.Content],
    [vocabs.as.EmbeddedView, [vocabs.as.ActivityHandler , vocabs.as.Content]],
    [vocabs.as.Event, vocabs.as.Object],
    [vocabs.as.Favorite, vocabs.as.Respond],
    [vocabs.as.Flag, vocabs.as.Respond],
    [vocabs.as.Folder, vocabs.as.Collection],
    [vocabs.as.Follow, vocabs.as.Activity],
    [vocabs.as.FriendRequest, vocabs.as.Connect],
    [vocabs.as.Give, vocabs.as.Offer],
    [vocabs.as.Group, vocabs.as.Actor],
    [vocabs.as.HttpRequest, [vocabs.as.ActivityHandler , vocabs.as.Link]],
    [vocabs.as.Ignore, vocabs.as.Respond],
    [vocabs.as.Image, vocabs.as.Document],
    [vocabs.as.Invite, vocabs.as.Offer],
    [vocabs.as.Join, vocabs.as.Activity],
    [vocabs.as.Leave, vocabs.as.Activity],
    [vocabs.as.Like, vocabs.as.Respond],
    [vocabs.as.Experience, vocabs.as.Activity],
    [vocabs.as.View, vocabs.as.Experience],
    [vocabs.as.Watch, vocabs.as.View],
    [vocabs.as.Listen, vocabs.as.Experience],
    [vocabs.as.Read, vocabs.as.View],
    [vocabs.as.Reservation, vocabs.as.Activity],
    [vocabs.as.Respond, vocabs.as.Activity],
    [vocabs.as.Move, vocabs.as.Activity],
    [vocabs.as.Travel, vocabs.as.IntransitiveActivity],
    [vocabs.as.Mention, vocabs.as.Link],
    [vocabs.as.Note, vocabs.as.Content],
    [vocabs.as.Offer, vocabs.as.Activity],
    [vocabs.as.OrderedCollection, vocabs.as.Collection],
    [vocabs.as.Organization, vocabs.as.Actor], 
    [vocabs.as.Page, vocabs.as.Content],
    [vocabs.as.Person, vocabs.as.Actor],
    [vocabs.as.Place, vocabs.as.Object],
    [vocabs.as.PossibleAnswer, vocabs.as.Content],
    [vocabs.as.Post, vocabs.as.Activity], 
    [vocabs.as.Process, vocabs.as.Actor],
    [vocabs.as.Question, [vocabs.as.Content, vocabs.as.IntransitiveActivity]],
    [vocabs.as.Reject, vocabs.as.Respond],
    [vocabs.as.Remove, vocabs.as.Activity],
    [vocabs.as.Review, vocabs.as.Respond],
    [vocabs.as.Role, vocabs.as.Actor],
    [vocabs.as.Save, vocabs.as.Activity],
    [vocabs.as.Service, vocabs.as.Actor],
    [vocabs.as.Share, vocabs.as.Activity],
    [vocabs.as.Story, vocabs.as.OrderedCollection],
    [vocabs.as.TentativeAccept, vocabs.as.Accept],
    [vocabs.as.TentativeReject, vocabs.as.Reject],
    [vocabs.as.Undo, vocabs.as.Activity],
    [vocabs.as.Video, vocabs.as.Document],
    [vocabs.interval.Interval, vocabs.as.Object],
    [vocabs.interval.OpenInterval, vocabs.interval.Interval],
    [vocabs.interval.ClosedInterval, vocabs.interval.Interval],
    [vocabs.interval.OpenClosedInterval, vocabs.interval.Interval],
    [vocabs.interval.ClosedOpenInterval, vocabs.interval.Interval],
    [vocabs.interval.LeftOpenInterval, vocabs.interval.Interval],
    [vocabs.interval.RightOpenInterval, vocabs.interval.Interval],
    [vocabs.interval.LeftClosedInterval, vocabs.interval.Interval],
    [vocabs.interval.RightClosedInterval, vocabs.interval.Interval],
    [vocabs.social.Population, vocabs.as.Object],
    [vocabs.social.Everyone, vocabs.social.Population],
    [vocabs.social.Public, vocabs.social.Population],
    [vocabs.social.Private, vocabs.social.Population],
    [vocabs.social.Direct, vocabs.social.Population],
    [vocabs.social.Common, vocabs.social.Population],
    [vocabs.social.Interested, vocabs.social.Population],
    [vocabs.social.Self, vocabs.social.Population],
    [vocabs.social.All, vocabs.social.CompoundPopulation],
    [vocabs.social.Any, vocabs.social.CompoundPopulation],
    [vocabs.social.None, vocabs.social.CompoundPopulation],
    [vocabs.social.CompoundPopulation, vocabs.social.Population]
  ].forEach(function (pair) {
    reasoner.add(pair[0], vocabs.rdfs.subClassOf, pair[1]);
  });

  var functionalObject = [vocabs.owl.ObjectProperty, vocabs.owl.FunctionalProperty],
      functionalDatatype = [vocabs.owl.DatatypeProperty , vocabs.owl.FunctionalProperty],
      deprecatedObject = [vocabs.owl.ObjectProperty, vocabs.owl.DeprecatedProperty],
      deprecatedDatatype = [vocabs.owl.DatatypeProperty, vocabs.owl.DeprecatedProperty],
      deprecatedFunctionalDatatype = [vocabs.owl.DatatypeProperty, vocabs.owl.FunctionalProperty, vocabs.owl.DeprecatedProperty],
      languageProperty = [vocabs.owl.DatatypeProperty , vocabs.asx.LanguageProperty];
  [
    [vocabs.rdf.first, functionalObject],
    [vocabs.rdf.rest, functionalObject],
    [vocabs.as.action, vocabs.owl.ObjectProperty],
    [vocabs.as.actor, vocabs.owl.ObjectProperty],
    [vocabs.as.actorOf, vocabs.owl.ObjectProperty],
    [vocabs.as.attributedTo, vocabs.owl.ObjectProperty],
    [vocabs.as.attributedWith, vocabs.owl.ObjectProperty],
    [vocabs.as.attachedTo, vocabs.owl.ObjectProperty],
    [vocabs.as.attachment, vocabs.owl.ObjectProperty],
    [vocabs.as.attachments, deprecatedObject],
    [vocabs.as.author, deprecatedObject],
    [vocabs.as.authorOf, deprecatedObject],
    [vocabs.as.bcc, vocabs.owl.ObjectProperty],
    [vocabs.as.bto, vocabs.owl.ObjectProperty],
    [vocabs.as.cc, vocabs.owl.ObjectProperty],
    [vocabs.as.context, vocabs.owl.ObjectProperty],
    [vocabs.as.contextOf, vocabs.owl.ObjectProperty],
    [vocabs.as.current, functionalObject],
    [vocabs.as.first, functionalObject],
    [vocabs.as.generator, vocabs.owl.ObjectProperty],
    [vocabs.as.generatorOf, vocabs.owl.ObjectProperty],
    [vocabs.as.handlerFor, vocabs.owl.ObjectProperty],
    [vocabs.as.hasExpectedInput, vocabs.owl.ObjectProperty],
    [vocabs.as.hasPotentialResult, vocabs.owl.ObjectProperty],
    [vocabs.as.hasPreference, vocabs.owl.ObjectProperty],
    [vocabs.as.hasRequirement, vocabs.owl.ObjectProperty],
    [vocabs.as.hreftemplate, functionalObject],
    [vocabs.as.icon, vocabs.owl.ObjectProperty],
    [vocabs.as.iconFor, vocabs.owl.ObjectProperty],
    [vocabs.as.image, vocabs.owl.ObjectProperty],
    [vocabs.as.imageOf, vocabs.owl.ObjectProperty],
    [vocabs.as.inReplyTo, vocabs.owl.ObjectProperty],
    [vocabs.as.items, vocabs.owl.ObjectProperty],
    [vocabs.as.last, functionalObject],
    [vocabs.as.location, vocabs.owl.ObjectProperty],
    [vocabs.as.locationOf, vocabs.owl.ObjectProperty],
    [vocabs.as.memberOf, vocabs.owl.ObjectProperty],
    [vocabs.as.next, functionalObject],
    [vocabs.as.object, vocabs.owl.ObjectProperty],
    [vocabs.as.objectOf, vocabs.owl.ObjectProperty],
    [vocabs.as.oneOf, vocabs.owl.ObjectProperty],
    [vocabs.as.anyOf, vocabs.owl.ObjectProperty],
    [vocabs.as.parameter, vocabs.owl.ObjectProperty],
    [vocabs.as.prev, functionalObject],
    [vocabs.as.preview, vocabs.owl.ObjectProperty],
    [vocabs.as.previewOf, vocabs.owl.ObjectProperty],
    [vocabs.as.provider, vocabs.owl.ObjectProperty],
    [vocabs.as.providerOf, vocabs.owl.ObjectProperty],
    [vocabs.as.replies, vocabs.owl.ObjectProperty],
    [vocabs.as.result, vocabs.owl.ObjectProperty], 
    [vocabs.as.resultOf, vocabs.owl.ObjectProperty],
    [vocabs.as.role, vocabs.owl.ObjectProperty],
    [vocabs.as.scope, vocabs.owl.ObjectProperty],
    [vocabs.as.scopeOf, vocabs.owl.ObjectProperty],
    [vocabs.as.self, functionalObject],
    [vocabs.as.shape, vocabs.owl.ObjectProperty],
    [vocabs.as.tag, vocabs.owl.ObjectProperty],
    [vocabs.as.tagOf, vocabs.owl.ObjectProperty],
    [vocabs.as.tags, deprecatedObject],
    [vocabs.as.target, vocabs.owl.ObjectProperty],
    [vocabs.as.targetOf, vocabs.owl.ObjectProperty],
    [vocabs.as.origin, vocabs.owl.ObjectProperty],
    [vocabs.as.originOf, vocabs.owl.ObjectProperty],
    [vocabs.as.to, vocabs.owl.ObjectProperty],
    [vocabs.as.url, vocabs.owl.ObjectProperty],
    [vocabs.as.using, vocabs.owl.ObjectProperty],
    [vocabs.as.accuracy, functionalDatatype],
    [vocabs.as.alias, functionalDatatype],
    [vocabs.as.altitude, functionalDatatype],
    [vocabs.as.browserContext, functionalDatatype],
    [vocabs.as.confirm, functionalDatatype],
    [vocabs.as.content, languageProperty],
    [vocabs.as.displayName, languageProperty],
    [vocabs.as.downstreamDuplicates, deprecatedDatatype],
    [vocabs.as.duration, functionalDatatype],
    [vocabs.as.endTime, functionalDatatype],
    [vocabs.as.height, functionalDatatype],
    [vocabs.as.href, functionalDatatype],
    [vocabs.as.hreflang, functionalDatatype],
    [vocabs.as.id, deprecatedFunctionalDatatype],
    [vocabs.as.itemsPerPage, functionalDatatype],
    [vocabs.as.latitude, functionalDatatype],
    [vocabs.as.longitude, functionalDatatype],
    [vocabs.as.mediaType, functionalDatatype],
    [vocabs.as.method, functionalDatatype],
    [vocabs.as.name, functionalDatatype],
    [vocabs.as.objectType, deprecatedFunctionalDatatype],
    [vocabs.as.priority, functionalDatatype],
    [vocabs.as.published, functionalDatatype],
    [vocabs.as.radius, functionalDatatype],
    [vocabs.as.rating, functionalDatatype],
    [vocabs.as.rel, vocabs.owl.DatatypeProperty],
    [vocabs.as.optional, functionalDatatype],
    [vocabs.as.sandbox, functionalDatatype],
    [vocabs.as.startIndex, functionalDatatype],
    [vocabs.as.startTime, functionalDatatype],
    [vocabs.as.summary, languageProperty],
    [vocabs.as.template, functionalDatatype],
    [vocabs.as.title, languageProperty],
    [vocabs.as.totalItems, functionalDatatype],
    [vocabs.as.units, functionalDatatype],
    [vocabs.as.updated, functionalDatatype],
    [vocabs.as.upstreamDuplicates, deprecatedDatatype],
    [vocabs.as.verb, deprecatedFunctionalDatatype],
    [vocabs.as.width, functionalDatatype],
    [vocabs.as.HttpHeader, vocabs.owl.Class],
    [vocabs.asx.indexRange, functionalObject],
    [vocabs.asx.publishedRange, functionalObject],
    [vocabs.asx.startTimeRange, functionalObject],
    [vocabs.interval.lower, functionalDatatype],
    [vocabs.interval.upper, functionalDatatype],
    [vocabs.interval.step, functionalDatatype],
    [vocabs.social.member, vocabs.owl.ObjectProperty],
    [vocabs.social.confidence, functionalDatatype],
    [vocabs.social.havingDimension, vocabs.owl.ObjectProperty],
    [vocabs.social.havingRole, vocabs.owl.ObjectProperty],
    [vocabs.social.havingRelationship, vocabs.owl.ObjectProperty],
    [vocabs.social.distance, functionalDatatype]
  ].forEach(function(pair) {
    reasoner.add(pair[0], vocabs.rdf.type, pair[1]);
  });

  [
    [vocabs.as.actor, vocabs.as.attributedTo],
    [vocabs.as.actorOf, vocabs.as.attributedWith],
    [vocabs.as.author, vocabs.as.attributedTo],
    [vocabs.as.authorOf, vocabs.as.attributedWith],
    [vocabs.as.result, vocabs.as.attributedWith],
    [vocabs.as.resultOf, vocabs.as.attributedTo]
  ].forEach(function(pair) {
    reasoner.add(pair[0], vocabs.rdfs.subPropertyOf, pair[1]);
  });


}

function Reasoner() {
  if (!(this instanceof Reasoner))
    return new Reasoner();
  utils.hidden(this, '_store', new N3.Store());
  utils.hidden(this, '_cache', {_sc:{},_sp:{},_tp:{}});
  _init(this);
}
Reasoner.prototype = {
  use_stream : function(stream, callback) {
    utils.throwif(!stream, 'A valid stream must be provided');
    utils.throwif(typeof callback !== 'function', 'A callback must be provided');
    var self = this;
    N3.Parser().parse(stream, function(err, triple) {
      if (err) {
        callback(err);
        return;
      }
      if (triple) {
        self.add(triple);
      } else {
        callback();
      }
    });
  },

  add : function(subject, predicate, object) {
    var _cache;
    switch(predicate) {
      case vocabs.rdfs.subClassOf:
        _cache = this._cache._sc[subject] = this._cache._sc[subject] || {};
        break;
      case vocabs.rdfs.subPropertyOf:
        _cache = this._cache._sp[subject] = this._cache._sp[subject] || {};
        break;
      case vocabs.rdf.type:
        _cache = this._cache._tp[subject] = this._cache._tp[subject] || {};
        break;
    }
    if (Array.isArray(object)) {
      for (var n = 0, l = object.length; n < l; n++) {
        this._store.addTriple(subject, predicate, object[n]);
        if (_cache) _cache[object[n]] = true;
      }
    } else {
      this._store.addTriple(subject, predicate, object);
      if (_cache) _cache[object] = true;
    }
    return this;
  },

  declare : function(prefix, uri) {
    this._store.addPrefix(prefix, uri);
    return this;
  },

  classHierarchy : function(subject) {
    return subClassHierarchy(this._store, subject);
  },

  propertyHierarchy : function(subject) {
    return subPropertyHierarchy(this._store, subject);
  },

  isSubClassOf : function(subject, object) {
    var _sc = this._cache._sc;
    var _subject = _sc[subject] = _sc[subject] || {};
    return _subject[object] = _subject[object] || 
           isSubClassOf(this._store, subject, object);
  },

  isSubPropertyOf : function(subject, object) {
    var _sp = this._cache._sp;
    var _subject = _sp[subject] = _sp[subject] || {};
    return _subject[object] = _subject[object] ||
          isSubPropertyOf(this._store, subject, object);
  },

  isTypeOf : function(subject, type) {
    var _tp = this._cache._tp;
    var _subject = _tp[subject] = _tp[subject] || {};
    return _subject[type] = _subject[type] || 
           count_type.call(this, subject, type) > 0
  },

  descendantClassesOf : function(subject) {
    return descendantClassesOf(this._store, subject);
  },

  descendantPropertiesOf : function(subject) {
    return descendantPropertiesOf(this._store, subject);
  },

  is_an_object : function(subject) {
    return !this.isSubClassOf(subject, as.Link);
  },

  is_a_link : function(subject) {
    return this.isSubClassOf(subject, as.Link);
  },

  is_object_property : function(subject) {
    return this.isTypeOf(subject, vocabs.owl.ObjectProperty);
  },

  is_functional : function(subject) {
    return this.isTypeOf(subject, vocabs.owl.FunctionalProperty);
  },

  is_deprecated : function(subject) {
    return this.isTypeOf(subject, vocabs.owl.DeprecatedProperty);
  },

  is_language_property : function(subject) {
    return this.isTypeOf(subject, vocabs.asx.LanguageProperty);
  },

  is_intransitive : function(subject) {
    return this.isSubClassOf(subject, vocabs.as.IntransitiveActivity);
  },

  is_possibly_ordered : function(subject) {
    return this.isSubClassOf(subject, vocabs.asx.PossiblyOrdered);
  },

  is_number : function(subject) {
    return this.isSubClassOf(subject, vocabs.asx.Number);
  },

  is_date : function(subject) {
    return this.isSubClassOf(subject, vocabs.asx.Date);
  },

  is_boolean : function(subject) {
    return this.isSubClassOf(subject, vocabs.asx.Boolean);
  }

};

module.exports = Reasoner;