import { default as testSetup } from '../../../fixtures/testSetup'

var should = require('chai').should()
  , MetadataReference = require('../../../../lib/metadata/reference/metadataReference').MetadataReference
  , Metadata = require('../../../../lib/metadata/metadata').Metadata
  , Verification = require('../../../fixtures/verification');

describe('Metadata Reference tests', function() {
  var testGeoPackage;
  var geopackage;

  beforeEach(async function() {
    let created = await testSetup.createTmpGeoPackage();
    testGeoPackage = created.path;
    geopackage = created.geopackage;
  });

  afterEach(async function() {
    try {
      geopackage.close();
      await testSetup.deleteGeoPackage(testGeoPackage);
    } catch (e) {
    }
  });

  it('should create metadata and reference', function() {
    geopackage.createMetadataTable();
    geopackage.createMetadataReferenceTable();
    Verification.verifyMetadataReference(geopackage).should.be.equal(true);
    Verification.verifyMetadata(geopackage).should.be.equal(true);

    var metadataDao = geopackage.metadataDao;
    var metadataReferenceDao = geopackage.metadataReferenceDao;

    var metadata1 = new Metadata();
    metadata1.id = 1;
    metadata1.md_scope = Metadata.DATASET;
    metadata1.md_standard_uri = "TEST_URI_1";
    metadata1.mime_type = 'text/xml';
    metadata1.metadata = 'TEST METDATA 1';

    var metadata2 = new Metadata();
    metadata2.id = 2;
    metadata2.md_scope = Metadata.FEATURE_TYPE;
    metadata2.md_standard_uri = "TEST_URI_2";
    metadata2.mime_type = 'text/xml';
    metadata2.metadata = 'TEST METDATA 2';

    var metadata3 = new Metadata();
    metadata3.id = 3;
    metadata3.md_scope = Metadata.TILE;
    metadata3.md_standard_uri = "TEST_URI_3";
    metadata3.mime_type = 'text/xml';
    metadata3.metadata = 'TEST METDATA 3';

    [metadata1, metadata2, metadata3].forEach(function(metadata) {
      var result = metadataDao.create(metadata);
      result.should.be.equal(metadata.id);
    });

    var ref1 = new MetadataReference();
    ref1.setReferenceScopeType(MetadataReference.GEOPACKAGE);
    ref1.timestamp = new Date();
    ref1.setMetadata(metadata1);

    var ref2 = new MetadataReference();
    ref2.setReferenceScopeType(MetadataReference.TABLE);
    ref2.table_name = 'TEST_TABLE_NAME_2';
    ref2.timestamp = new Date();
    ref2.setMetadata(metadata2);
    ref2.setParentMetadata(metadata1);

    [ref1, ref2].forEach(function(ref) {
      metadataReferenceDao.create(ref);
    });
  });

  it('should create metadata and reference with a parent and then remove it', function() {
    geopackage.createMetadataTable();
    geopackage.createMetadataReferenceTable();
    Verification.verifyMetadataReference(geopackage).should.be.equal(true);
    Verification.verifyMetadata(geopackage).should.be.equal(true);

    var metadataDao = geopackage.metadataDao;
    var metadataReferenceDao = geopackage.metadataReferenceDao;

    var metadata1 = new Metadata();
    metadata1.id = 1;
    metadata1.md_scope = Metadata.DATASET;
    metadata1.md_standard_uri = "TEST_URI_1";
    metadata1.mime_type = 'text/xml';
    metadata1.metadata = 'TEST METDATA 1';

    var metadata2 = new Metadata();
    metadata2.id = 2;
    metadata2.md_scope = Metadata.FEATURE_TYPE;
    metadata2.md_standard_uri = "TEST_URI_2";
    metadata2.mime_type = 'text/xml';
    metadata2.metadata = 'TEST METDATA 2';

    [metadata1, metadata2].forEach(function(metadata) {
      var result = metadataDao.create(metadata);
      result.should.be.equal(metadata.id);
    });

    var ref = new MetadataReference();
    ref.setReferenceScopeType(MetadataReference.TABLE);
    ref.table_name = 'TEST_TABLE_NAME_2';
    ref.timestamp = new Date();
    ref.setMetadata(metadata2);
    ref.setParentMetadata(metadata1);
    metadataReferenceDao.create(ref);
    var count = 0;
    for (var row of metadataReferenceDao.queryByMetadataParent(metadata1.id)) {
      count++;
    }
    count.should.be.equal(1);
    var result = metadataReferenceDao.removeMetadataParent(metadata1.id);
    var countAfter = 0;
    for (var row of metadataReferenceDao.queryByMetadataParent(metadata1.id)) {
      countAfter++;
    }
  });

  it('should query for metadatareference by metadata and parent', function() {
    geopackage.createMetadataTable();
    geopackage.createMetadataReferenceTable();
    Verification.verifyMetadataReference(geopackage).should.be.equal(true);
    Verification.verifyMetadata(geopackage).should.be.equal(true);

    var metadataDao = geopackage.metadataDao;
    var metadataReferenceDao = geopackage.metadataReferenceDao;

    var metadata1 = new Metadata();
    metadata1.id = 1;
    metadata1.md_scope = Metadata.DATASET;
    metadata1.md_standard_uri = "TEST_URI_1";
    metadata1.mime_type = 'text/xml';
    metadata1.metadata = 'TEST METDATA 1';

    var metadata2 = new Metadata();
    metadata2.id = 2;
    metadata2.md_scope = Metadata.FEATURE_TYPE;
    metadata2.md_standard_uri = "TEST_URI_2";
    metadata2.mime_type = 'text/xml';
    metadata2.metadata = 'TEST METDATA 2';

    var metadata3 = new Metadata();
    metadata3.id = 3;
    metadata3.md_scope = Metadata.TILE;
    metadata3.md_standard_uri = "TEST_URI_3";
    metadata3.mime_type = 'text/xml';
    metadata3.metadata = 'TEST METDATA 3';

    [metadata1, metadata2, metadata3].forEach(function(metadata) {
      var result = metadataDao.create(metadata);
      result.should.be.equal(metadata.id);
    });

    var ref1 = new MetadataReference();
    ref1.setReferenceScopeType(MetadataReference.GEOPACKAGE);
    ref1.timestamp = new Date();
    ref1.setMetadata(metadata1);
    ref1.md_file_id.should.be.equal(metadata1.id);
    should.not.exist(ref1.table_name);
    should.not.exist(ref1.column_name);
    should.not.exist(ref1.row_id_value);

    var ref2 = new MetadataReference();
    ref2.setReferenceScopeType(MetadataReference.TABLE);
    ref2.table_name = 'TEST_TABLE_NAME_2';
    ref2.timestamp = new Date();
    ref2.setMetadata(metadata2);
    ref2.setParentMetadata(metadata1);

    should.not.exist(ref2.column_name);
    should.not.exist(ref2.row_id_value);
    ref2.md_parent_id.should.be.equal(metadata1.id);

    var ref3 = new MetadataReference();
    ref3.setReferenceScopeType(MetadataReference.ROW);
    ref3.timestamp = new Date();
    ref3.setMetadata();
    ref3.setParentMetadata();
    ref3.md_file_id.should.be.equal(-1);
    ref3.md_parent_id.should.be.equal(-1);
    should.not.exist(ref3.column_name);

    var ref4 = new MetadataReference();
    ref4.setReferenceScopeType(MetadataReference.COLUMN);
    ref4.timestamp = new Date();
    ref4.setMetadata(metadata1);

    should.not.exist(ref4.row_id_value);

    [ref1, ref2].forEach(function(ref) {
      metadataReferenceDao.create(ref);
    });

    for (var row of metadataReferenceDao.queryByMetadataAndParent(metadata2.id, metadata1.id)) {
      row.table_name.should.be.equal('TEST_TABLE_NAME_2');
      row.md_file_id.should.be.equal(metadata2.id);
      row.md_parent_id.should.be.equal(metadata1.id);
    }
  });

  it('should query for metadatareference by metadata', function() {

    geopackage.createMetadataTable();
    geopackage.createMetadataReferenceTable();
    Verification.verifyMetadataReference(geopackage).should.be.equal(true);
    Verification.verifyMetadata(geopackage).should.be.equal(true);

    var metadataDao = geopackage.metadataDao;
    var metadataReferenceDao = geopackage.metadataReferenceDao;

    var metadata1 = new Metadata();
    metadata1.id = 1;
    metadata1.md_scope = Metadata.DATASET;
    metadata1.md_standard_uri = "TEST_URI_1";
    metadata1.mime_type = 'text/xml';
    metadata1.metadata = 'TEST METDATA 1';

    var metadata2 = new Metadata();
    metadata2.id = 2;
    metadata2.md_scope = Metadata.FEATURE_TYPE;
    metadata2.md_standard_uri = "TEST_URI_2";
    metadata2.mime_type = 'text/xml';
    metadata2.metadata = 'TEST METDATA 2';

    var metadata3 = new Metadata();
    metadata3.id = 3;
    metadata3.md_scope = Metadata.TILE;
    metadata3.md_standard_uri = "TEST_URI_3";
    metadata3.mime_type = 'text/xml';
    metadata3.metadata = 'TEST METDATA 3';

    [metadata1, metadata2, metadata3].forEach(function(metadata) {
      var result = metadataDao.create(metadata);
      result.should.be.equal(metadata.id);
    });

    var ref1 = new MetadataReference();
    ref1.setReferenceScopeType(MetadataReference.GEOPACKAGE);
    ref1.timestamp = new Date();
    ref1.setMetadata(metadata2);

    var ref2 = new MetadataReference();
    ref2.setReferenceScopeType(MetadataReference.TABLE);
    ref2.table_name = 'TEST_TABLE_NAME_2';
    ref2.timestamp = new Date();
    ref2.setMetadata(metadata2);
    ref2.setParentMetadata(metadata1);

    [ref1, ref2].forEach(function(ref) {
      metadataReferenceDao.create(ref);
    });
    var count = 0;
    for (var row of metadataReferenceDao.queryByMetadata(metadata2.id)) {
      row.md_file_id.should.be.equal(metadata2.id);
      count++;
    }

    count.should.be.equal(2);
  });
});
