import React, { Component } from 'react';
import { Container, Table, Row, Col, Button, Modal, Form, FormControl } from 'react-bootstrap';
import { Axios as api, API_ENDPOINTS as urls } from '../../services/api.service';
import * as Icon from 'react-icons/fi';


export default class Announcements extends Component {
    constructor(props) {
        super(props);
        document.title = "Opus | Announcements";
        this.state = {
            showCreateModal: false,
            userTeams: [],
            userAnnouncements: [],
            teamToIdDict: {},
            idToTeamDict: {},
            announcementBody: '',
            teamFilter: 'All',
            colorDict: {
                'high': 'table-danger',
                'medium': 'table-warning',
                'low': 'table-success'
            }, 
        }
    }

    componentDidMount() {
        if (this.props.userInfo.username) {
            this.fetchData();
        }
    }

    async fetchData() {
        let teamIds = this.props.userInfo.cliques;
        let teams = []
        let newTeamDict = {};
        let newIdDict = {};
        for (let id of teamIds) {
            const request = await api.get(urls.teams.fetchById(id));
            teams.push(request.data);
            newTeamDict[request.data.name] = id;
            newIdDict[id] = request.data.name;
        }
        this.setState({
            teamToIdDict: newTeamDict,
            idToTeamDict: newIdDict,
            userTeams: teams
        }, () => {this.fetchAnnouncements()});
    }

    async fetchAnnouncements() {
        let announcements = [];
        for (let team of this.state.userTeams) {
            const request = await api.get(urls.announcement.fetchByTeam(team.name));
            announcements = announcements.concat(request.data);   
        }
        this.setState({userAnnouncements: announcements});
    }

    async handleCreate(evt) {
        evt.preventDefault();
        let body = {
            announcement: this.state.announcementBody,
            clique: 1,
            event: 1,
        };
        let request = await api.post(urls.announcement.fetchAll, body);
        if (request.status === 201) {
            let newAnnouncements = this.state.userAnnouncements;
            newAnnouncements.push(body);
            this.setState({userAnnouncements: newAnnouncements});
        }
        else {
            console.warn('Error creating announcement. Please try again.');
        }
    }

    render() {
        return (
            <Container fluid>
                <Modal show={this.state.showCreateModal} onHide={() => {this.setState({showCreateModal: false})}}>
                    <Modal.Header>
                        <Modal.Title>Create an announcement</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={(e) => {this.handleCreate(e)}}>
                            <Form.Group>
                                <Form.Label>Select Group</Form.Label>
                                <Form.Control as="select">
                                    {this.state.userTeams.map((team) => {
                                        return <option key={team.id}>{team.name}</option>
                                    })}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Announcement</Form.Label>
                                <Form.Control 
                                    as="textarea"
                                    placeholder="Type your announcement here..."
                                    value={this.state.announcementBody}
                                    onChange={(e) => {this.setState({announcementBody: e.target.value})}}
                                >
                                </Form.Control>
                            </Form.Group>
                            <Button type="submit" onClick={() => {this.setState({showCreateModal: false})}}>Submit</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Row>
                    <Col>
                        <h1>Announcements</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={{span: 10}}>
                        <Button style={{'marginTop': '10px', 'marginBottom': '10px'}} onClick={() => {this.setState({showCreateModal: true})}}><Icon.FiPlusCircle style={{'marginTop' : '-3px'}} /> Create Announcement</Button>
                    </Col>
                    <Col>
                        <Row>
                            <h6 style={{'marginTop': '15px'}}>Filter by Team: </h6>
                            <FormControl style={{'marginTop': '10px', 'marginBottom': '10px', 'marginLeft': '10px'}} as="select" onChange={(e) => {this.setState({teamFilter: e.target.value})}}>
                                <option>All</option>
                                {this.state.userTeams.map((team) => {
                                    return <option key={team.id}>{team.name}</option>;
                                })}
                            </FormControl>
                        </Row>
                    </Col>
                </Row>
                <Table bordered>
                    <thead>
                        <tr key={-1}>
                            <th>Priority</th>
                            <th>Team</th>
                            <th>Creator</th>
                            <th>Message</th>
                            <th>Associated Event</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.userAnnouncements.map((announcement) => {
                            let name = this.state.idToTeamDict[announcement.clique];
                            if (this.state.teamFilter === 'All' || this.state.teamFilter === name) {
                                return (
                                    <tr key={announcement.id} className={this.state.colorDict[announcement.priority]}>
                                        <td>No priority field yet</td>
                                        <td>{this.state.idToTeamDict[announcement.clique]}</td>
                                        <td>No creator field yet</td>
                                        <td>{announcement.announcement}</td>
                                        <td>{announcement.event}</td>
                                    </tr>
                                )
                            }
                            else {
                                return <tr></tr>;
                            }
                        })}
                    </tbody>
                </Table>
            </Container>
        )
    }
}