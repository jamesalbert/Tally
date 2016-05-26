/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AlertIOS,
  AppRegistry,
  DatePickerIOS,
  Image,
  ListView,
  NavigatorIOS,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
var RNCalendarReminders = require('react-native-calendar-reminders');

var HomePage = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      elections: ds
    }
  },

  componentDidMount: function() {
    RNCalendarReminders.authorizeEventStore(({status}) => {
      if (status == 'denied') {
        AlertIOS.alert('We can\'t remind you about elections without permission');
      }
    });
    fetch('https://api.open.fec.gov/v1/election-dates/?sort=-election_date&election_state=CA&page=1&min_election_date=2016-05-14&per_page=20&api_key=DEMO_KEY', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((json) => {
      this.setState({elections: this.state.elections.cloneWithRows(json.results)});
    })
  },

  render: function() {
    return (
      <ListView
        dataSource={this.state.elections}
        renderRow={(rowData) => this.parseElection(rowData)}
      />
    );
  },

  setReminder: function(title: string, date: string) {
    weekBefore = new Date(date+'T20:00:00.000');
    weekBefore.setDate(weekBefore.getDate() - 7);
    RNCalendarReminders.saveReminder(title, {
      //location: 'location',
      //notes: 'notes',
      dueDate: new Date(date+'T20:00:00.000').toISOString(),
      recurrence: 'daily',
      alarms: [{
        date: weekBefore.toISOString()
      }]
    });
    AlertIOS.alert('reminder set');
  },

  renderElection: function(election: Object) {
    return (
      <TouchableHighlight
        style={styles.container}
        onPress={() => this.setReminder(election.title, election.election_date)}>
        <View style={styles.election}>
          <View style={styles.info}>
            <Text style={styles.infoText}>{election.title}</Text>
            <Text style={styles.infoDate}>{election.election_date}</Text>
          </View>
          <View style={styles.thumb}>
            <Icon name={election.icon} style={styles.icon} size={25} color='grey' />
          </View>
        </View>
      </TouchableHighlight>
    )
  },

  parseElection: function(election: Object) {
    title = election.election_type_full+' for ';
    switch (election.office_sought) {
      case 'P':
        title += 'President';
        break;
      case 'H':
        title += 'Representative of '+election.election_state;
        break;
      case 'S':
        title += 'Senator of '+election.election_state;
    }
    election.title = title;
    election.icon = 'bank';
    return this.renderElection(election);
  }
})

var Tally = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.nav}
        initialRoute={{
          component: HomePage,
          title: 'Tally',
          passProps: {},
          leftButtonTitle: 'Settings',
          onLeftButtonPress: () => {
            AlertIOS.alert("settings");
          },
          rightButtonTitle: 'Next',
          onRightButtonPress: () => {
            AlertIOS.alert("nope!");
          },
          barTintColor: '#32cd32',
          tintColor: 'white',
          titleTextColor: 'white'
        }}
      />
    );
  }
})

const styles = StyleSheet.create({
  nav: {
    flex: 1,
  },
  container: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 3,
    backgroundColor: 'white',
    borderColor: 'rgba(128, 128, 128, 0.02)',
    borderBottomWidth: 1,
  },
  election: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  thumb: {
    flex: .1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingLeft: 10
  },
  icon: {
    paddingRight: 20,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  info: {
    flex: .7,
    paddingLeft: 5
  },
  infoText: {
    fontFamily: 'Roboto-Regular',
    paddingTop: 10,
  },
  infoDate: {
    fontFamily: 'Roboto-Regular',
    paddingTop: 5,
    fontSize: 10,
    color: 'grey'
  }
});

AppRegistry.registerComponent('Tally', () => Tally);
