import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button, Table, Row, Col, Container, Figure, Form, Nav, Navbar, Alert, Spinner } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NavHeader from './NavbarComponents';
import UserContext from './UserContext';
import API from '../API';
import dayjs from "dayjs";

function Loading(props) {
  return (
    <Spinner className='m-2' animation="border" role="status" />
  )
}

function BlockView(props) {
  const block = props.block;
  if (block.block_type === 'paragraph') {
    return (
      <Row className="justify-content-center">
        <p>{block.content}</p>
      </Row>
    )
  }
  else if (block.block_type === 'image') {
    return (
      <Row className="justify-content-center">
        <Figure>
          <Figure.Image className="mx-auto" style={{ display: 'block', margin: '0 auto' }} width={171} height={180} src={block.content} />
        </Figure>
      </Row>)
  }
  else if (block.block_type === 'header') {
    return (
      <Row className="justify-content-center">
        <h3>{block.content}</h3>
      </Row>)
  }
  else {
    return (
      <Row>
        <p>Unknown block type</p>
      </Row>
    )
  }
}

function PageView(props) {
  const [currentPage, setCurrentPage] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(''); //for the handleError function
  const page_id = useParams().page_id;
  const navigate = useNavigate();

  function handleError(err) {
    console.log('err: ' + JSON.stringify(err));  // Only for debug
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0])
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
    } else if (err.error) {
      errMsg = err.error;
    }
    setErrorMessage(errMsg+"(Unrecoverable error)");
  }
  /* Load page from database at mount */
  useEffect(() => {
    API.getPageWithContent(page_id).then(page => {
      setCurrentPage(page);
      setLoading(false);
    }
    ).catch(err => {
      handleError(err);
    }
    );
  }, []);

  let status = "";
  if (currentPage && !currentPage.publication_date.isValid()) {
    status = 'draft';
  }
  else if (currentPage && currentPage.publication_date.isAfter(dayjs(), 'day')) {
    status = 'programmed';
  }
  else if (currentPage && (currentPage.publication_date.isBefore(dayjs(), 'day') || currentPage.publication_date.isSame(dayjs(), 'day'))) {
    status = 'published';
  }

  return (
    <>
      <NavHeader hidden={true} />
      {errorMessage ? <Alert variant='danger' dismissible className='my-2' onClose={() => setErrorMessage('')}>
        {errorMessage}</Alert> : null /*For error coming from APIs */}

      {(!currentPage && loading) ? <Loading /> :
        <Container fluid>
          <Navbar bg="light" expand="lg">
            <Container fluid>
            <Button variant="primary" onClick={() => navigate("/")}>Back</Button>
              <Nav>Author: {currentPage.author_name}</Nav>
              <Nav>Created on: {currentPage.creation_date.format("YYYY-MM-DD")}</Nav>
              <Nav>Published on: {(currentPage.publication_date.isValid() ? currentPage.publication_date.format("YYYY-MM-DD") : "Not defined") + " (" + status + ")"}</Nav>
            </Container>
          </Navbar>
          <h1>{currentPage.title}</h1>
          {currentPage.blocks.sort((a, b) => a.position - b.position).map((e) => <BlockView key={e.position} block={e} />)}
        </Container>}
      <Button variant="primary" onClick={() => navigate("/")}>Back</Button>
    </>
  )
}

function BlockEdit(props) {
  const position = props.position;
  const block = props.blocks.find(b => b.position === position);
  const images = props.images;
  let blockForm;
  const countRows = (block) => {
    const count = (block.content.match(/\r\n|\r|\n/g) || []).length;
    return count + 1;
  }

  if (block.block_type === 'paragraph') {
    blockForm =
      <Form.Group className='mb-3'>
        <Form.Control as="textarea" rows={countRows(block)} name="paragraph" value={block.content} onChange={ev => props.handleContentChange(ev.target.value, position)} />
      </Form.Group>;
  }
  else if (block.block_type === 'header') {
    blockForm =
      <Form.Group className='mb-3'>
        <Form.Control type="text" name="header" value={block.content} onChange={ev => props.handleContentChange(ev.target.value, position)} />
      </Form.Group>
  }
  else if (block.block_type === 'image') {
    blockForm =
      <Form.Group className='mb-3'>
        <Form.Select value={block.content} onChange={ev => props.handleContentChange(ev.target.value, position)} >
          <option>Select an image</option>
          {images.map((e) => <option key={e.image_id} value={e.image_path}>{e.image_name}</option>)}
        </Form.Select>
        <Container fluid>
          <Figure>
            <Figure.Image width={171} height={180} src={block.content} alt={"No image selected"} />
          </Figure>
        </Container>
      </Form.Group>
  }
  return (
    <Container fluid>
      {/*Controlled select, on change will manage the update of the block type*/}
      <span>
        <Form.Label>
          <Form.Select value={block.block_type} onChange={ev => props.handleBlockTypeChange(ev.target.value, position)}>
            <option value={"paragraph"}>Paragraph</option>
            <option value={"header"}>Header</option>
            <option value={"image"}>Image</option>
          </Form.Select>
        </Form.Label>
        {block.position === 0 ? false : <Button variant='outline-primary'><i className='bi bi-arrow-up-square' onClick={() => props.moveUp(block.position)} /></Button>}
        {block.position === props.blocks.length - 1 ? false : <Button variant='outline-success'><i className='bi bi-arrow-down-square' onClick={() => props.moveDown(block.position)} /></Button>}
        <Button variant="outline-danger" onClick={() => props.deleteBlock(block.position)} ><i className='bi bi-trash' /></Button>
      </span>
      {blockForm}

    </Container>
  )
}

function PageEdit(props) {
  //Form for adding/editing a newpage. The decision is based on the props passed (addPage or editPage)
  const [currentPage, setCurrentPage] = useState(undefined);
  const [blocks, setBlocks] = useState([]);
  const [images, setImages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newBlockType, setNewBlockType] = useState("paragraph");
  const [errorMessage, setErrorMessage] = useState(""); //Same both for form validation errors and other errors
  const [loading, setLoading] = useState(true); //initial loading
  const page_id = useParams().page_id;
  const navigate = useNavigate();
  const session = useContext(UserContext);

  function handleError(err) {
    console.log('err: ' + JSON.stringify(err));
    let errMsg = 'Unkwnown error';
    if (err.errors) {
      if (err.errors[0])
        if (err.errors[0].msg)
          errMsg = err.errors[0].msg;
    } else if (err.error) {
      errMsg = err.error;
    }
    setErrorMessage(errMsg+"(Unrecoverable error)");
  }

  /* Position is used as unique identifier, since it's always unique at page scope*/
  const handleSubmit = (ev) => {
    ev.preventDefault();
    let flag = false;
    blocks.forEach(b => {
      if (b.content.trim() === "") {
        setErrorMessage("You can't submit a page with empty blocks");
        flag = true;
      }
    });
    if (currentPage.title.trim() === "") {
      setErrorMessage("You can't submit a page with empty title");
      flag = true;
    }

    if (currentPage.publication_date.isBefore(currentPage.creation_date, 'day')) {
      setErrorMessage("You can't submit a page with a publication date before the creation date");
      flag = true;
    }
    if (flag) { return; }
    //If the date is not valid, pass it to the API as undefined
    const page = { page_id: currentPage.page_id, author_id: currentPage.author_id, title: currentPage.title, publication_date: currentPage.publication_date.isValid() ? currentPage.publication_date : undefined, blocks: blocks };
    if (props.editPage) {
      props.editPage(page);
    }
    else if (props.addPage) {
      props.addPage(page);
    }
    navigate("/");
  }

  const handleContentChange = (value, position) => {
    /* Value depends on old value of state, i need to set the state with a callback to avoid inconsistencies*/
    setBlocks(oldBlocks => {
      const newBlocks = oldBlocks.map(b => {
        if (b.position === position) {
          return { ...b, content: value };
        }
        else {
          return b;
        }
      });
      return newBlocks;
    })
  }

  const handleBlockTypeChange = (value, position) => {
    //check errors on number of headers and blocks
    let tempBlocks = blocks.map(b => {
      if (b.position === position) {
        return { ...b, block_type: value };
      }
      else {
        return b;
      }
    });
    let headerCount = tempBlocks.filter(b => b.block_type === "header").length;
    let blockCount = tempBlocks.filter(b => b.block_type != "header").length;
    if (headerCount < 1){
      setErrorMessage("You need at least one header in your page");
      return;
    }
    if (blockCount < 1){
      setErrorMessage("You need at least one other block in addition to the header(s)");
      return;
    }
    setBlocks(oldBlocks => {
      const newBlocks = oldBlocks.map(b => {
        if (b.position === position) {
          /* Maintain the content if new type is still a text type */
          if ((b.block_type === "paragraph" || b.block_type === "header") && (value === "paragraph" || value === "header")) {
            return { ...b, block_type: value };
          }
          /*In any other case, reset the content to empty content */
          else {
            return { ...b, block_type: value, content: "" };
          }
        }
        else {
          return b;
        }
      })
      return newBlocks;
    })
  }

  const moveUp = (oldPosition) => {
    setBlocks(oldBlocks => {
      const newBlocks = oldBlocks.map(b => {
        if (b.position == oldPosition) {
          return { ...b, position: b.position - 1 };
        }
        else if (b.position === oldPosition - 1) {
          return { ...b, position: b.position + 1 };
        }
        else {
          return b;
        }
      })
      return newBlocks;
    })
  }

  const moveDown = (oldPosition) => {
    setBlocks(oldBlocks => {
      const newBlocks = oldBlocks.map(b => {
        if (b.position == oldPosition) {
          return { ...b, position: b.position + 1 };
        }
        else if (b.position === oldPosition + 1) {
          return { ...b, position: b.position - 1 };
        }
        else {
          return b;
        }
      })
      return newBlocks;
    })
  }

  const addBlock = () => {
    setBlocks(oldBlocks => {
      return [...oldBlocks, { block_type: newBlockType, content: "", position: oldBlocks.length }];
    });
  }

  const deleteBlock = (position) => {
    //check errors on number of headers and blocks
    let nHeaders = blocks.filter(b => b.block_type === "header").length;
    if (blocks.find(b => b.position === position).block_type === "header") { nHeaders--; }
    if (nHeaders < 1) {
      setErrorMessage("You need at least one header in your page");
      return;
    }
    else if (blocks.length - nHeaders - 1 < 1) {
      setErrorMessage("You need at least one other block in addition to the header(s)");
      return;
    }
    setBlocks(oldBlocks => {
      const newBlocks = oldBlocks.filter(b => b.position !== position)
        .map(b => {
          if (b.position > position) {
            return { ...b, position: b.position - 1 };
          }
          else {
            return b;
          }
        })
      return newBlocks;
    })
  }

  const handleDateChange = (date) => {
    setCurrentPage(oldPage => {
      return { ...oldPage, publication_date: dayjs(date) };
    })
  }

  const handleTitleChange = (title) => {
    setCurrentPage(oldPage => {
      return { ...oldPage, title: title };
    })
  }

  const handleAuthorChange = (author_id) => {
    //The id arrives as a string from the select, so i need only "=="
    const author_name = users.find(u => u.id == author_id).name;
    setCurrentPage(oldPage => {
      return { ...oldPage, author_id: Number(author_id), author_name: author_name };
    })
  }

  /* Load page or initialize new page based on props at mount */
  useEffect(() => {
    //load list of images from database
    if (props.editPage) {//load page from database
      //If the user is an admin, get all users to populate the select to change author
      Promise.all([API.getImages(), API.getPageWithContent(page_id), (session.user && session.user.admin) ? API.getUsers() : Promise.resolve([])])
        .then(values => {
          setImages(values[0]);
          setCurrentPage({ ...values[1], blocks: undefined});
          setBlocks(values[1].blocks);
          setUsers(values[2]);
          setLoading(false);
        })
        .catch(err => {
          handleError(err);
        });
    }
    else if (props.addPage) {//initialize a new page
      //If the user is an admin, get all users to populate the select to change author
      Promise.all([API.getImages(), (session.user && session.user.admin) ? API.getUsers() : Promise.resolve([])])
        .then(values => {
          setImages(values[0]);
          setUsers(values[1]);
          setCurrentPage({ page_id: null, author_id: session.user && session.user.id, author_name: session.user && session.user.name, title: "", creation_date: dayjs(), publication_date: dayjs(), blocks: undefined });
          setBlocks([{ block_type: "header", content: "", position: 0 }, { block_type: "paragraph", content: "", position: 1 }]);
          setLoading(false);
        })
        .catch(err => {
          handleError(err);
        });
    }
  }, []);
  return (
    <>
      <NavHeader hidden={true} />
      {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <Container fluid>
        {(!currentPage && loading) ? <Loading /> :
          <>
            <Form onSubmit={handleSubmit}>
              <Navbar bg="light" expand="lg">
                <Container fluid>
                <Button variant="primary" onClick={() => navigate("/")}>Back</Button>
                  <Nav>Author: {session.user && !session.user.admin ? currentPage.author_name :
                    <Form.Select value={currentPage.author_id} onChange={ev => handleAuthorChange(ev.target.value)}>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </Form.Select>
                  }</Nav>
                  <Nav></Nav>
                  <Nav>Created on: {currentPage.creation_date.format("YYYY-MM-DD")}</Nav>
                  <Nav>Published on: <Form.Control type="date" name="date" value={currentPage.publication_date.format("YYYY-MM-DD")} onChange={ev => handleDateChange(ev.target.value)} /></Nav>
                </Container>
              </Navbar>
              <Container fluid>
              <Form.Group className='mb-3'>
                <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={currentPage.title} onChange={ev => handleTitleChange(ev.target.value)} />
              </Form.Group>
              {blocks.sort((a, b) => a.position - b.position).map((e) => <BlockEdit key={e.position} images={images} position={e.position} blocks={blocks} handleContentChange={handleContentChange} handleBlockTypeChange={handleBlockTypeChange} deleteBlock={deleteBlock} moveUp={moveUp} moveDown={moveDown} />)}
              </Container>
              <Form.Group className='mb-3'>
                <Button variant="success" onClick={addBlock}>Add new block</Button>
                <Form.Label>
                  <Form.Select value={newBlockType} onChange={ev => setNewBlockType(ev.target.value)}>
                    <option value={"paragraph"}>Paragraph</option>
                    <option value={"header"}>Header</option>
                    <option value={"image"}>Image</option>
                  </Form.Select>
                </Form.Label>
              </Form.Group>
              <Button variant="primary" type="submit">Save</Button>
              <Button variant="warning" onClick={() => navigate("/")}>Back</Button>
            </Form>
          </>
        }
      </Container>
    </>
  )
}

export { PageView, PageEdit };