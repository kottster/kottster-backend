import { CodeExtractor } from '../../../lib/services/codeExtractor.service'
import mock from 'mock-fs';
import { getSampleProceduresFileContent, getSampleMetricFileProcedure } from '../../utils/samples';

describe('services/codeExtractor', () => {
  const filePath = `${process.cwd()}/src/__generated__/dev/procedures/page_p1_metric_m1.js`;
  const fileContent = getSampleProceduresFileContent();
  
  beforeEach(() => {
    mock({
      [filePath]: fileContent
    });
  });
  
  afterEach(() => {
    mock.restore();
  });

  it('should extract procedures from a file', async () => {
    const codeExtractor = new CodeExtractor();

    // Extract procedures from the file
    const procedures = await codeExtractor.getComponentProceduresFromFile('p1', 'metric', 'm1');
    expect(procedures).toEqual([
      getSampleMetricFileProcedure()
    ]);
  });
});